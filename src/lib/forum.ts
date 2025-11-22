export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ForumForum {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
}

export type ForumThreadStatus = 'open' | 'in_progress' | 'resolved';

export interface ForumThread {
  id: string;
  title: string;
  body: string;
  slug?: string;
  category?: ForumCategory;
  forum?: ForumForum;
  created_at: string;
  created_by?: string;
  reply_count?: number;
  is_locked?: boolean;
  view_count?: number;
  status?: ForumThreadStatus;
  google_connected?: boolean;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  author_email: string | null;
  created_at: string;
  is_solution?: boolean;
}

type ServiceResult<T> = { data: T | null; error: Error | null };

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const categories: ForumCategory[] = [
  { id: 'cat-1', name: 'Duyurular', slug: 'duyurular', description: 'Site ve topluluk duyuruları' },
  { id: 'cat-2', name: 'Topluluk', slug: 'topluluk', description: 'Genel sohbet ve tanışma' },
];

const forums: ForumForum[] = [
  { id: 'forum-1', category_id: 'cat-1', name: 'Site Duyuruları', slug: 'site-duyurulari' },
  { id: 'forum-2', category_id: 'cat-2', name: 'Genel Sohbet', slug: 'genel-sohbet' },
];

const threads: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Yeni forum yapısı yayında!',
    body: 'Kategori ve alt forumlarla tasarlanan yeni forum deneyimini keşfedin.',
    slug: 'yeni-forum-yapisi',
    category: categories[0],
    forum: forums[0],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reply_count: 2,
    created_by: 'admin',
    view_count: 120,
    status: 'in_progress',
    google_connected: true,
  },
  {
    id: 'thread-2',
    title: 'Projelerinizde kullandığınız en sevdiğiniz sensör hangisi?',
    body: 'Arduino veya Raspberry Pi projelerinde vazgeçilmeziniz olan sensörü paylaşın.',
    slug: 'favori-sensorler',
    category: categories[1],
    forum: forums[1],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reply_count: 4,
    view_count: 85,
    status: 'open',
  },
  {
    id: 'thread-3',
    title: '3D yazıcı ile en pratik baskı ipuçları',
    body: 'PLA, PETG veya ABS baskılarınızda uyguladığınız püf noktalarını listeleyin.',
    slug: '3d-yazici-ipuclari',
    category: categories[1],
    forum: forums[1],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    reply_count: 1,
    view_count: 40,
    status: 'resolved',
  },
];

const replies: ForumReply[] = [
  {
    id: 'reply-1',
    thread_id: 'thread-1',
    body: 'Tasarım gerçekten harika görünüyor, emeği geçenlere teşekkürler!',
    author_id: 'user-1',
    author_email: 'user1@example.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'reply-2',
    thread_id: 'thread-1',
    body: 'Mobilde de performans gayet iyi çalışıyor.',
    author_id: 'user-2',
    author_email: 'user2@example.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    is_solution: true,
  },
];

export function getForumCategoriesWithForums(): Promise<ServiceResult<(ForumCategory & { forums: ForumForum[] })[]>> {
  const data = categories.map((category) => ({
    ...category,
    forums: forums.filter((forum) => forum.category_id === category.id),
  }));
  return Promise.resolve({ data, error: null });
}

export function getLatestThreads(limit = 10): ForumThread[] {
  return threads
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getForumThreadById(id: string): Promise<ServiceResult<ForumThread>> {
  const thread = threads.find((t) => t.id === id) || null;
  return Promise.resolve({ data: thread, error: thread ? null : new Error('Thread not found') });
}

export function getForumReplies(threadId: string): Promise<ServiceResult<ForumReply[]>> {
  const threadReplies = replies.filter((reply) => reply.thread_id === threadId);
  return Promise.resolve({ data: threadReplies, error: null });
}

export function createForumReply({
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
  const reply: ForumReply = {
    id: createId('reply'),
    thread_id,
    body,
    author_id,
    author_email,
    created_at: new Date().toISOString(),
  };
  replies.push(reply);
  const thread = threads.find((t) => t.id === thread_id);
  if (thread) {
    thread.reply_count = (thread.reply_count || 0) + 1;
  }
  return Promise.resolve({ data: reply, error: null });
}

export function getSimilarThreads({
  forumId,
  categoryId,
  excludeId,
}: {
  forumId?: string;
  categoryId?: string;
  excludeId?: string;
}): ForumThread[] {
  return threads.filter((thread) => {
    if (excludeId && thread.id === excludeId) return false;
    if (forumId && thread.forum?.id !== forumId) return false;
    if (categoryId && thread.category?.id !== categoryId) return false;
    return true;
  });
}

export function getUserForumRole(userId: string): Promise<'admin' | 'moderator' | 'user'> {
  if (userId === 'admin') return Promise.resolve('admin');
  return Promise.resolve('user');
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

export function createForumThread({
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
  const category = categories.find((c) => c.id === category_id);
  const forum = forums.find((f) => f.id === forum_id);

  if (!category || !forum) {
    return Promise.resolve({ data: null, error: new Error('Kategori veya forum bulunamadı') });
  }

  const thread: ForumThread = {
    id: createId('thread'),
    title,
    body,
    slug: slugify(title) || undefined,
    category,
    forum,
    created_at: new Date().toISOString(),
    reply_count: 0,
    view_count: 0,
    created_by: author_id,
    status: 'open',
  };

  threads.unshift(thread);

  return Promise.resolve({ data: thread, error: null });
}

export function incrementThreadViewCount(threadId: string) {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    thread.view_count = (thread.view_count || 0) + 1;
  }
}

export function markThreadSolved(threadId: string, replyId: string): Promise<ServiceResult<boolean>> {
  const thread = threads.find((t) => t.id === threadId);
  const reply = replies.find((r) => r.id === replyId);
  if (!thread || !reply) {
    return Promise.resolve({ data: null, error: new Error('Thread or reply not found') });
  }

  replies.forEach((r) => {
    if (r.thread_id === threadId) {
      r.is_solution = r.id === replyId;
    }
  });
  return Promise.resolve({ data: true, error: null });
}

export function buildThreadPath(thread: ForumThread) {
  return `/forum/konu/${thread.slug || thread.id}-${thread.id}`;
}
