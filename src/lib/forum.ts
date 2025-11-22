import { supabase } from './supabase';
import { slugify } from './slug';
import type { ForumCategory, ForumForum, ForumReply, ForumResult, ForumThread } from './forumTypes';
import {
  addMockReply,
  addMockThread,
  getMockCategories,
  getMockCategory,
  getMockForum,
  getMockReplies,
  getMockRole,
  getMockThread,
  getMockThreads,
  incrementMockView,
  markMockSolution,
} from './forumMockData';

export type { ForumCategory, ForumForum, ForumReply, ForumResult, ForumThread, ForumStatus } from './forumTypes';

type ForumForumRow = ForumForum & { forum_threads?: { count: number }[] };
type CategoryRow = ForumCategory & { forum_forums?: ForumForumRow[] };
type ThreadRow = ForumThread & { forum_replies?: { count: number }[]; forum_forums?: ForumForum & { forum_categories?: ForumCategory } };

const DEV_MOCKS_ENABLED = import.meta.env.VITE_ENABLE_FORUM_MOCKS !== 'false';

function errorResult<T>(error: Error | null, fallback?: T): ForumResult<T> {
  if (error) console.error(error);
  if (DEV_MOCKS_ENABLED && fallback) {
    return { data: fallback, error: null };
  }
  return { data: null, error: error ?? new Error('Bilinmeyen hata') };
}

export async function getForumCategoriesWithForums(): Promise<ForumResult<(ForumCategory & { forums: ForumForum[] })[]>> {
  if (DEV_MOCKS_ENABLED) {
    return { data: getMockCategories(), error: null };
  }

  const { data, error } = await supabase
    .from('forum_categories')
    .select(
      `id, name, slug, description, created_at, forum_forums (id, name, slug, description, category_id, created_at, forum_threads (count))`
    )
    .order('created_at', { ascending: true });

  if (error || !data) {
    return errorResult(error ?? new Error('Kategori verisi alınamadı'));
  }

  const categories = (data as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    created_at: category.created_at,
    forums: (category.forum_forums ?? []).map((forum) => ({
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
  if (DEV_MOCKS_ENABLED) {
    const category = getMockCategory(slug);
    return category ? { data: category, error: null } : errorResult(new Error('Kategori bulunamadı'));
  }

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

  const categoryData = data as CategoryRow;

  return {
    data: {
      id: categoryData.id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      created_at: categoryData.created_at,
      forums: (categoryData.forum_forums ?? []).map((forum) => ({
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
  if (DEV_MOCKS_ENABLED) {
    const forum = getMockForum(categorySlug, forumSlug);
    return forum ? { data: forum, error: null } : errorResult(new Error('Forum bulunamadı'));
  }

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
  if (DEV_MOCKS_ENABLED) {
    return { data: getMockThreads(forumId), error: null };
  }

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
    data: (data as ThreadRow[]).map((thread) => ({
      ...thread,
      reply_count: thread.forum_replies?.[0]?.count ?? 0,
    })),
    error: null,
  };
}

export async function getForumThreadById(threadId: string): Promise<ForumResult<ForumThread>> {
  if (DEV_MOCKS_ENABLED) {
    const thread = getMockThread(threadId);
    return thread ? { data: thread, error: null } : errorResult(new Error('Konu bulunamadı'));
  }

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
      ...(data as ThreadRow),
      forum: (data as ThreadRow).forum_forums,
      category: (data as ThreadRow).forum_forums?.forum_categories,
    },
    error: null,
  };
}

export async function getForumReplies(threadId: string): Promise<ForumResult<ForumReply[]>> {
  if (DEV_MOCKS_ENABLED) {
    return { data: getMockReplies(threadId), error: null };
  }

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

  if (DEV_MOCKS_ENABLED) {
    return { data: addMockThread(payload), error: null };
  }

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

  if (DEV_MOCKS_ENABLED) {
    return { data: addMockReply(payload), error: null };
  }

  const { data, error } = await supabase.from('forum_replies').insert(payload).select().single();

  if (error || !data) {
    return errorResult(error ?? new Error('Yanıt eklenemedi'));
  }

  await supabase.from('forum_threads').update({ last_activity_at: now }).eq('id', reply.thread_id);

  return { data, error: null };
}

export async function markThreadSolved(threadId: string, replyId: string): Promise<ForumResult<null>> {
  if (DEV_MOCKS_ENABLED) {
    markMockSolution(threadId, replyId);
    return { data: null, error: null };
  }

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
  if (DEV_MOCKS_ENABLED) {
    incrementMockView(threadId);
    return;
  }

  const { error } = await supabase.rpc('increment_thread_views', { p_thread_id: threadId });
  if (error) {
    console.error('Görüntülenme artışı başarısız:', error);
  }
}

export async function getUserForumRole(userId: string): Promise<'admin' | 'moderator' | 'user' | null> {
  if (DEV_MOCKS_ENABLED) {
    return getMockRole(userId);
  }

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

export function getLatestThreads(limit = 12): ForumThread[] {
  const threads = getMockThreads('all');
  return threads
    .sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime())
    .slice(0, limit);
}

export function getSimilarThreads({
  forumId,
  categoryId,
  excludeId,
  limit = 6,
}: {
  forumId?: string;
  categoryId?: string;
  excludeId?: string;
  limit?: number;
}): ForumThread[] {
  const threads = getLatestThreads(30);

  return threads
    .filter((thread) => {
      if (excludeId && thread.id === excludeId) return false;
      if (forumId && thread.forum_id !== forumId) return false;
      if (!forumId && categoryId) {
        return thread.category?.id === categoryId;
      }
      return true;
    })
    .slice(0, limit);
}
