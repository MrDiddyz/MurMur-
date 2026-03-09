export type WorkKind = 'image' | 'music';

export interface Work {
  id: string;
  title: string;
  kind: WorkKind;
  description: string | null;
  file_path: string;
  price_cents: number;
  is_published: boolean;
  creator_id: string;
  created_at: string;
}
