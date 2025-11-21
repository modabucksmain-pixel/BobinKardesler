export type ForumStatus = 'open' | 'in_progress' | 'resolved';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface ForumForum {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  thread_count?: number;
  category?: ForumCategory;
}

export interface ForumThread {
  id: string;
  forum_id: string;
  title: string;
  slug: string | null;
  body: string;
  tags: string[];
  status: ForumStatus;
  created_by: string | null;
  created_by_email: string | null;
  google_connected: boolean;
  solution_reply_id: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  is_locked: boolean;
  reply_count?: number;
  forum?: ForumForum;
  category?: ForumCategory;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  body: string;
  author_id: string | null;
  author_email: string | null;
  is_admin_response: boolean;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumResult<T> {
  data: T | null;
  error: Error | null;
}
