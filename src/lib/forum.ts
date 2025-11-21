import { supabase } from './supabase';
import { slugify } from './slug';

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

const DEV_MOCKS_ENABLED = import.meta.env.VITE_ENABLE_FORUM_MOCKS === 'true';

function errorResult<T>(error: Error | null, fallback?: T): ForumResult<T> {
  if (error) console.error(error);
  if (DEV_MOCKS_ENABLED && fallback) {
    return { data: fallback, error: null };
  }
  return { data: null, error: error ?? new Error('Bilinmeyen hata') };
}

export async function getForumCategoriesWithForums(): Promise<ForumResult<(ForumCategory & { forums: ForumForum[] })[]>> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select(
      `id, name, slug, description, created_at, forum_forums (id, name, slug, description, category_id, created_at, forum_threads (count))`
    )
    .order('created_at', { ascending: true });

  if (error || !data) {
    return errorResult(error ?? new Error('Kategori verisi alınamadı'));
  }

  const categories = data.map((category: any) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    created_at: category.created_at,
    forums: (category.forum_forums ?? []).map((forum: any) => ({
      id: forum.id,
      category_id: forum.category_id,
      name: forum.name,
      slug: forum.slug,
      description: forum.description,
      created_at: forum.created_at,
      thread_count: forum.forum_threads?.[0]?.count ?? 0,
    })),
  }));

  return { data: categories, error: null };
}

export async function getCategoryWithForums(slug: string): Promise<ForumResult<ForumCategory & { forums: ForumForum[] }>> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select(
      `id, name, slug, description, created_at, forum_forums (id, name, slug, description, category_id, created_at, forum_threads (count))`
    )
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return errorResult(error ?? new Error('Kategori bulunamadı'));
  }

  return {
    data: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      created_at: data.created_at,
      forums: (data.forum_forums ?? []).map((forum: any) => ({
        id: forum.id,
        category_id: forum.category_id,
        name: forum.name,
        slug: forum.slug,
        description: forum.description,
        created_at: forum.created_at,
        thread_count: forum.forum_threads?.[0]?.count ?? 0,
      })),
    },
    error: null,
  };
}

export async function getForumBySlugs(categorySlug: string, forumSlug: string): Promise<ForumResult<ForumForum>> {
  const { data, error } = await supabase
    .from('forum_forums')
    .select(
      `id, name, slug, description, category_id, created_at, forum_categories!inner(id, name, slug)`
    )
    .eq('slug', forumSlug)
    .eq('forum_categories.slug', categorySlug)
    .single();

  if (error || !data) {
    return errorResult(error ?? new Error('Forum bulunamadı'));
  }

  return {
    data: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      category_id: data.category_id,
      created_at: data.created_at,
      category: data.forum_categories,
    },
    error: null,
  };
}

export async function getForumThreads(forumId: string): Promise<ForumResult<ForumThread[]>> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(
      `id, forum_id, title, slug, body, tags, status, created_by, created_by_email, google_connected, solution_reply_id, last_activity_at, created_at, updated_at, view_count, is_locked, forum_replies (count)`
    )
    .eq('forum_id', forumId)
    .order('last_activity_at', { ascending: false });

  if (error || !data) {
    return errorResult(error ?? new Error('Forum başlıkları alınamadı'));
  }

  return {
    data: data.map((thread: any) => ({
      ...thread,
      reply_count: thread.forum_replies?.[0]?.count ?? 0,
    })),
    error: null,
  };
}

export async function getForumThreadById(threadId: string): Promise<ForumResult<ForumThread>> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(
      `id, forum_id, title, slug, body, tags, status, created_by, created_by_email, google_connected, solution_reply_id, last_activity_at, created_at, updated_at, view_count, is_locked,
       forum_forums!inner(id, name, slug, category_id, forum_categories!inner(id, name, slug))`
    )
    .eq('id', threadId)
    .single();

  if (error || !data) {
    return errorResult(error ?? new Error('Konu bulunamadı'));
  }

  return {
    data: {
      ...data,
      forum: data.forum_forums,
      category: data.forum_forums?.forum_categories,
    },
    error: null,
  };
}

export async function getForumReplies(threadId: string): Promise<ForumResult<ForumReply[]>> {
  const { data, error } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return errorResult(error ?? new Error('Yanıtlar alınamadı'));
  }

  return { data, error: null };
}

export async function createForumThread(
  thread: Omit<ForumThread, 'id' | 'created_at' | 'updated_at' | 'last_activity_at' | 'view_count' | 'reply_count' | 'forum' | 'category'>
): Promise<ForumResult<ForumThread>> {
  const now = new Date().toISOString();
  const payload = {
    ...thread,
    slug: thread.slug || slugify(thread.title),
    created_at: now,
    updated_at: now,
    last_activity_at: now,
  };

  const { data, error } = await supabase.from('forum_threads').insert(payload).select().single();

  if (error || !data) {
    return errorResult(error ?? new Error('Forum başlığı oluşturulamadı'));
  }

  return { data, error: null };
}

export async function createForumReply(
  reply: Omit<ForumReply, 'id' | 'created_at' | 'updated_at' | 'is_admin_response' | 'is_solution'>
): Promise<ForumResult<ForumReply>> {
  const now = new Date().toISOString();
  const payload = {
    ...reply,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('forum_replies').insert(payload).select().single();

  if (error || !data) {
    return errorResult(error ?? new Error('Yanıt eklenemedi'));
  }

  await supabase.from('forum_threads').update({ last_activity_at: now }).eq('id', reply.thread_id);

  return { data, error: null };
}

export async function markThreadSolved(threadId: string, replyId: string): Promise<ForumResult<null>> {
  const { error } = await supabase.rpc('mark_thread_solution', {
    p_thread_id: threadId,
    p_reply_id: replyId,
  });

  if (error) {
    return errorResult(error);
  }

  return { data: null, error: null };
}

export async function incrementThreadViewCount(threadId: string) {
  const { error } = await supabase.rpc('increment_thread_views', { p_thread_id: threadId });
  if (error) {
    console.error('Görüntülenme artışı başarısız:', error);
  }
}

export async function getUserForumRole(userId: string): Promise<'admin' | 'moderator' | 'user' | null> {
  const { data, error } = await supabase.from('user_profiles').select('role').eq('id', userId).single();
  if (error) {
    console.error('Rol alınamadı:', error);
    return null;
  }
  return (data?.role as 'admin' | 'moderator' | 'user') ?? 'user';
}

export function buildThreadPath(thread: Pick<ForumThread, 'id' | 'title' | 'slug'>) {
  const safeSlug = thread.slug && thread.slug.length > 0 ? thread.slug : slugify(thread.title);
  return `/forum/konu/${safeSlug}-${thread.id}`;
}
