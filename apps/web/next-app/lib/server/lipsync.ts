import { getEnv } from '@/lib/server/env';

export type LipsyncJobStatus =
  | 'queued'
  | 'voice_generating'
  | 'voice_ready'
  | 'lipsync_generating'
  | 'completed'
  | 'failed';

export type LipsyncJobRecord = {
  id: string;
  user_id: string;
  script: string;
  image_path: string;
  voice_path: string | null;
  video_path: string | null;
  provider_tts: 'elevenlabs';
  provider_lipsync: 'did' | 'heygen';
  status: LipsyncJobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type JobEventRecord = {
  id: number;
  job_id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function getSupabaseConfig() {
  return {
    supabaseUrl: getEnv('SUPABASE_URL'),
    serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

async function supabaseAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase REST error (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

function getStoragePathParts(path: string) {
  const [bucket, ...segments] = path.split('/');
  const objectPath = segments.join('/');

  if (!bucket || !objectPath) {
    throw new Error('Invalid storage path. Expected format: <bucket>/<objectPath>');
  }

  return { bucket, objectPath };
}

export async function createSignedUploadUrl(input: {
  bucket: 'images';
  objectPath: string;
  expiresIn: number;
}): Promise<{ signedUrl: string; path: string; token: string }> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/upload/sign/${input.bucket}/${input.objectPath}`,
    {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: input.expiresIn }),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Storage signed upload URL error (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { signedURL: string; token: string };
  return {
    signedUrl: payload.signedURL,
    token: payload.token,
    path: `${input.bucket}/${input.objectPath}`,
  };
}

export async function createJob(input: {
  userId: string;
  script: string;
  imagePath: string;
  lipsyncProvider: 'did' | 'heygen';
}): Promise<LipsyncJobRecord> {
  const rows = await supabaseAdminRequest<LipsyncJobRecord[]>('lipsync_jobs', {
    method: 'POST',
    body: JSON.stringify([
      {
        user_id: input.userId,
        script: input.script,
        image_path: input.imagePath,
        provider_tts: 'elevenlabs',
        provider_lipsync: input.lipsyncProvider,
        status: 'queued',
      },
    ]),
  });

  return rows[0];
}

export async function listJobs(userId: string, limit = 20): Promise<LipsyncJobRecord[]> {
  return supabaseAdminRequest<LipsyncJobRecord[]>(
    `lipsync_jobs?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=${limit}`,
    {
      method: 'GET',
    },
  );
}

export async function getJob(jobId: string, userId: string): Promise<LipsyncJobRecord | null> {
  const rows = await supabaseAdminRequest<LipsyncJobRecord[]>(
    `lipsync_jobs?id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}&select=*`,
  );

  return rows[0] ?? null;
}

export async function updateJob(jobId: string, userId: string, patch: Partial<LipsyncJobRecord>) {
  const rows = await supabaseAdminRequest<LipsyncJobRecord[]>(
    `lipsync_jobs?id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    },
  );

  return rows[0] ?? null;
}

export async function addJobEvent(input: {
  jobId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  await supabaseAdminRequest<JobEventRecord[]>('lipsync_job_events', {
    method: 'POST',
    body: JSON.stringify([
      {
        job_id: input.jobId,
        user_id: input.userId,
        event_type: input.eventType,
        payload: input.payload,
      },
    ]),
  });
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  const { bucket, objectPath } = getStoragePathParts(storagePath);
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Storage delete error (${response.status}): ${await response.text()}`);
  }
}

export async function deleteJob(jobId: string, userId: string): Promise<void> {
  await supabaseAdminRequest(
    `lipsync_job_events?job_id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        Prefer: 'return=minimal',
      },
    },
  );

  await supabaseAdminRequest(
    `lipsync_jobs?id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        Prefer: 'return=minimal',
      },
    },
  );
}
