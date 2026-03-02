import { query } from '../../shared/db';

export const auditLog = async (
  accountId: string,
  action: string,
  metadata: Record<string, unknown>
): Promise<void> => {
  await query(
    `INSERT INTO audit_logs (account_id, action, metadata)
     VALUES ($1, $2, $3)`,
    [accountId, action, JSON.stringify(metadata)]
  );
};
