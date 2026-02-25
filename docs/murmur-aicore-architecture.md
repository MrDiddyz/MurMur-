# MurMurAiCore Architecture Snapshot

## Folder structure

```txt
src/
  app/murmur-aicore/
    page.tsx
    layout.tsx
    about/page.tsx
    how-it-works/page.tsx
    learning-path/page.tsx
    pricing/page.tsx
    certification/page.tsx
    organizations/page.tsx
    auth/page.tsx
    build-order/page.tsx
    app/
      dashboard/page.tsx
      learning/page.tsx
      practice-lab/page.tsx
      community/page.tsx
      certification/page.tsx
      ambassador/page.tsx
      admin/page.tsx
  app/api/murmur/
    progression/[userId]/route.ts
    entitlements/[userId]/route.ts
    certifications/eligibility/[userId]/route.ts
  components/murmur/
    core-nav.tsx
    section-shell.tsx
  lib/murmur/
    domain.ts
    access.ts
    progression.ts
    mock-data.ts
supabase/
  murmur_aicore_schema.sql
```

## Core service boundaries

- **Membership**: plan models + entitlement resolver in `lib/murmur/domain.ts` and `lib/murmur/access.ts`.
- **Learning progression**: metric logic in `lib/murmur/progression.ts`.
- **Operational APIs**: route handlers for progression, entitlements, and certification eligibility under `app/api/murmur/*`.
- **Data layer**: Supabase schema and RLS policies in `supabase/murmur_aicore_schema.sql`.
