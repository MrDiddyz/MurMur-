# Spawn Session Authorization Hardening

## Observed request shape

```json
{
  "sub": "user_123",
  "role": "architect",
  "permissions": ["spawn_node", "deploy_module", "read_logs"],
  "organization": "murmur-lab"
}
```

And client-side gate:

```js
if (!permissions.includes("spawn_node")) {
  deny();
}
```

Followed by:

- `POST /spawn-session` → creates Kubernetes pod, mounts user volume, injects scoped token, attaches terminal stream.

## Risks

1. **Client-side permission checks are not authorization.**
   Any user can tamper with `permissions` in a browser/client context. The API must independently verify authorization from a signed token and server-side policy.
2. **Role/permission trust confusion.**
   If role and permission claims are copied from untrusted input instead of verified JWT claims + database policy, users may escalate privileges.
3. **Missing organization binding checks.**
   `organization` must be validated against the authenticated subject's membership and project scope; otherwise cross-tenant pod spawn is possible.
4. **Double invocation hazard.**
   The duplicate `POST /spawn-session` flow suggests accidental retries or race conditions. Without idempotency keys and quota checks, a user can spawn duplicate pods and exhaust resources.
5. **Token scope safety.**
   Injected pod token must be least-privilege, short-lived, audience-restricted, and tied to both user + session.

## Required server-side controls

- Verify JWT signature, issuer, audience, expiry.
- Resolve permissions from trusted backend policy (RBAC/ABAC), not raw request body.
- Enforce org membership and project-level authorization.
- Require `Idempotency-Key` on spawn requests; dedupe within TTL.
- Add per-user/org rate limits and active-session quotas.
- Use explicit Kubernetes admission constraints (namespace, image allowlist, resource caps, seccomp/apparmor, no host mounts, no privilege escalation).
- Mint scoped ephemeral workload tokens (minutes, not hours), rotate automatically.
- Audit every spawn attempt (allowed + denied) with actor, org, reason, request hash.

## Reference server flow (pseudocode)

```ts
app.post('/spawn-session', async (req, res) => {
  const authn = await verifyAccessToken(req.headers.authorization); // sig/aud/iss/exp
  if (!authn.ok) return res.status(401).json({ error: 'unauthenticated' });

  const actor = authn.sub;
  const orgId = req.body.organization;

  const membership = await policy.getMembership(actor, orgId);
  if (!membership) return res.status(403).json({ error: 'not_in_org' });

  const allowed = await policy.hasPermission({
    subject: actor,
    orgId,
    action: 'session.spawn',
  });
  if (!allowed) return res.status(403).json({ error: 'forbidden' });

  const idemKey = req.headers['idempotency-key'];
  if (!idemKey) return res.status(400).json({ error: 'missing_idempotency_key' });

  const existing = await spawnStore.findByIdempotencyKey(actor, orgId, idemKey);
  if (existing) return res.status(200).json(existing.publicView());

  await quota.enforce({ actor, orgId, action: 'session.spawn' });

  const token = await tokenService.mintScopedToken({
    sub: actor,
    orgId,
    scope: ['terminal:attach', 'volume:mount:own'],
    ttlSeconds: 300,
    audience: 'murmur-session-pod',
  });

  const session = await orchestrator.createPod({
    actor,
    orgId,
    token,
    securityContext: hardenedSecurityContext,
  });

  await audit.log('session.spawn.allowed', { actor, orgId, sessionId: session.id });
  await spawnStore.bindIdempotencyKey(actor, orgId, idemKey, session.id);

  res.status(201).json(session.publicView());
});
```

## Minimal policy checklist

- [ ] Authorization source is server-side.
- [ ] Org tenant boundary enforced.
- [ ] Duplicate spawn prevented with idempotency.
- [ ] Rate limit + quota configured.
- [ ] Pod security baseline enforced.
- [ ] Scoped token TTL ≤ 5 minutes.
- [ ] Full audit trail for spawn attempts.
