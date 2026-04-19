import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, AuthorizationError, NotFoundError, QuotaExceededError, controlPlaneStore } from '@/lib/control-plane/store';
import { TenantRole } from '@/lib/control-plane/types';

export function parseBearerToken(request: NextRequest): string {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing bearer token.');
  }

  return header.slice('Bearer '.length).trim();
}

export function resolveTenantFromRequest(request: NextRequest): { tenantId: string; role: TenantRole } {
  const rawApiKey = parseBearerToken(request);
  const { tenant } = controlPlaneStore.resolveTenant(rawApiKey);

  const roleHeader = request.headers.get('x-tenant-role') as TenantRole | null;
  const role: TenantRole = roleHeader ?? 'member';

  return { tenantId: tenant.id, role };
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof QuotaExceededError) {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }

  return NextResponse.json({ error: 'Unexpected control plane error.' }, { status: 500 });
}
