export type PostStatus = 'created' | 'queued' | 'published' | 'failed';

export interface CreatePostRequest {
  accountId: string;
  caption: string;
  videoUrl: string;
}
