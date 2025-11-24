import { supabase } from './supabase';
import type { Database } from './database.types';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface ForumForum {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export type ForumThreadStatus = 'open' | 'in_progress' | 'resolved';

export interface ForumThread {
  id: string;
  forum_id?: string;
  title: string;
  body: string;
  slug?: string;
  category?: ForumCategory;
  forum?: ForumForum;
  created_at: string;
  created_by?: string;
  created_by_email?: string | null;
  reply_count?: number;
  is_locked?: boolean;
  view_count?: number;
  status?: ForumThreadStatus;
  google_connected?: boolean;
  solution_reply_id?: string | null;
  last_activity_at?: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  author_email: string | null;
  created_at: string;
  updated_at?: string;
  is_solution?: boolean;
}

type ServiceResult<T> = { data: T | null; error: Error | null };

type ForumCategoryRow = Database['public']['Tables']['forum_categories']['Row'];
type ForumForumRow = Database['public']['Tables']['forum_forums']['Row'];
type ForumThreadRow = Database['public']['Tables']['forum_threads']['Row'];
type ForumPostRow = Database['public']['Tables']['forum_posts']['Row'];

type ThreadRowWithRelations = ForumThreadRow & {
  forum?: (ForumForumRow & { category?: ForumCategoryRow | null }) | null;
  forum_posts?: { count: number }[] | null;
};

const THREAD_SELECT = `
  id, title, body, slug, status, tags, created_at, created_by, created_by_email, google_connected, solution_reply_id, last_activity_at, view_count, is_locked, forum_id,
  forum:forum_forums (id, category_id, name, slug, description, created_at, category:forum_categories (id, name, slug, description, created_at)),
  forum_posts(count)
`;

function mapCategory(row?: ForumCategoryRow | null): ForumCategory | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    created_at: row.created_at,
  };
}

function mapForum(row?: (ForumForumRow & { category?: ForumCategoryRow | null }) | null): ForumForum | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    created_at: row.created_at,
  };
}

function mapThread(row: ThreadRowWithRelations): ForumThread {
  const category = mapCategory(row.forum?.category);
  return {
    id: row.id,
    forum_id: row.forum_id,
    title: row.title,
    body: row.body,
    slug: row.slug ?? undefined,
    category,
    forum: mapForum(row.forum),
    created_at: row.created_at,
    created_by: row.created_by ?? undefined,
    created_by_email: row.created_by_email,
    reply_count: row.forum_posts?.[0]?.count ?? 0,
    is_locked: row.is_locked ?? undefined,
    view_count: row.view_count,
    status: row.status ?? undefined,
    google_connected: row.google_connected ?? undefined,
    solution_reply_id: row.solution_reply_id,
    last_activity_at: row.last_activity_at,
  };
}

function mapReply(row: ForumPostRow): ForumReply {
  return {
    id: row.id,
    thread_id: row.thread_id,
    body: row.body,
    author_id: row.author_id ?? 'anon',
    author_email: row.author_email,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_solution: row.is_solution ?? undefined,
  };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);

export async function getForumCategoriesWithForums(): Promise<
  ServiceResult<(ForumCategory & { forums: ForumForum[] })[]>
> {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('id, name, slug, description, created_at, forums:forum_forums(id, category_id, name, slug, description, created_at)')
      .order('name', { ascending: true });

    if (error) throw error;

    const categories = (data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      created_at: category.created_at,
      forums: (category.forums ?? []).map((forum) => ({
        id: forum.id,
        category_id: forum.category_id,
        name: forum.name,
        slug: forum.slug,
        description: forum.description ?? undefined,
        created_at: forum.created_at,
      })),
    }));

    return { data: categories, error: null };
  } catch (err) {
    console.error('Error fetching forum categories:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function getLatestThreads(limit = 10): Promise<ForumThread[]> {
  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(THREAD_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map(mapThread);
  } catch (err) {
    console.error('Error fetching latest threads:', err);
    return [];
  }
}

export async function getForumThreadById(id: string): Promise<ServiceResult<ForumThread>> {
  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(THREAD_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { data: null, error: new Error('Thread not found') };

    return { data: mapThread(data as ThreadRowWithRelations), error: null };
  } catch (err) {
    console.error('Error fetching forum thread:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function getForumReplies(threadId: string): Promise<ServiceResult<ForumReply[]>> {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: (data ?? []).map(mapReply), error: null };
  } catch (err) {
    console.error('Error fetching forum replies:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function createForumReply({
  thread_id,
  body,
  author_id,
  author_email,
}: {
  thread_id: string;
  body: string;
  author_id: string;
  author_email: string | null;
}): Promise<ServiceResult<ForumReply>> {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        thread_id,
        body,
        author_id,
        author_email,
      })
      .select('*')
      .single();

    if (error) throw error;

    return { data: mapReply(data), error: null };
  } catch (err) {
    console.error('Error creating forum reply:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function getSimilarThreads({
  forumId,
  categoryId,
  excludeId,
}: {
  forumId?: string;
  categoryId?: string;
  excludeId?: string;
}): Promise<ForumThread[]> {
  try {
    let forumIds: string[] = [];

    if (!forumId && categoryId) {
      const { data: categoryForums } = await supabase
        .from('forum_forums')
        .select('id')
        .eq('category_id', categoryId);
      forumIds = (categoryForums ?? []).map((forum) => forum.id);
    }

    const query = supabase
      .from('forum_threads')
      .select(THREAD_SELECT)
      .order('created_at', { ascending: false })
      .limit(5);

    if (forumId) query.eq('forum_id', forumId);
    else if (forumIds.length) query.in('forum_id', forumIds);

    if (excludeId) query.neq('id', excludeId);

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(mapThread);
  } catch (err) {
    console.error('Error fetching similar threads:', err);
    return [];
  }
}

export async function getUserForumRole(userId: string): Promise<'admin' | 'moderator' | 'user'> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    return data?.role ?? 'user';
  } catch (err) {
    console.error('Error fetching user forum role:', err);
    return 'user';
  }
}

export async function createForumThread({
  title,
  body,
  category_id,
  forum_id,
  author_id,
}: {
  title: string;
  body: string;
  category_id: string;
  forum_id: string;
  author_id?: string;
}): Promise<ServiceResult<ForumThread>> {
  try {
    const { data: forum, error: forumError } = await supabase
      .from('forum_forums')
      .select('id, category_id')
      .eq('id', forum_id)
      .maybeSingle();

    if (forumError) throw forumError;
    if (!forum || forum.category_id !== category_id) {
      return { data: null, error: new Error('Kategori veya forum bulunamadı') };
    }

    const slug = slugify(title);

    const { data, error } = await supabase
      .from('forum_threads')
      .insert({
        title,
        body,
        forum_id,
        slug: slug || null,
        created_by: author_id ?? null,
        status: 'open',
        tags: [],
      })
      .select(THREAD_SELECT)
      .single();

    if (error) throw error;

    return { data: mapThread(data as ThreadRowWithRelations), error: null };
  } catch (err) {
    console.error('Error creating forum thread:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function incrementThreadViewCount(threadId: string, currentCount = 0) {
  const { error } = await supabase
    .from('forum_threads')
    .update({ view_count: currentCount + 1 })
    .eq('id', threadId);

  if (error) {
    console.error('Error incrementing view count:', error);
  }
}

export async function markThreadSolved(threadId: string, replyId: string): Promise<ServiceResult<boolean>> {
  try {
    await supabase.from('forum_posts').update({ is_solution: false }).eq('thread_id', threadId);

    const { error: replyError } = await supabase
      .from('forum_posts')
      .update({ is_solution: true })
      .eq('id', replyId);

    if (replyError) throw replyError;

    const { error: threadError } = await supabase
      .from('forum_threads')
      .update({ solution_reply_id: replyId, status: 'resolved' })
      .eq('id', threadId);

    if (threadError) throw threadError;

    return { data: true, error: null };
  } catch (err) {
    console.error('Error marking solution:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export function buildThreadPath(thread: ForumThread) {
  return `/forum/konu/${thread.slug || thread.id}-${thread.id}`;
}
