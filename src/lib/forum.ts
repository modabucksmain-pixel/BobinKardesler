import { slugify } from './slug';

export type ForumStatus = 'open' | 'in_progress' | 'resolved';

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
  thread_count?: number;
}

export interface ForumThread {
  id: string;
  forum_id: string;
  category_id: string;
  title: string;
  body: string;
  created_at: string;
  slug?: string;
  status?: ForumStatus;
  is_locked?: boolean;
  google_connected?: boolean;
  reply_count?: number;
  view_count?: number;
  category?: ForumCategory;
  forum?: ForumForum;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_email?: string;
  author_id?: string;
  body: string;
  created_at: string;
  is_solution?: boolean;
}

type NullableError = { message: string } | null;

const categories: ForumCategory[] = [
  {
    id: 'cat-1',
    name: 'Genel Konular',
    slug: 'genel',
    description: 'Site kuralları, duyurular ve topluluk yönergeleri',
  },
  {
    id: 'cat-2',
    name: 'Yardım ve Destek',
    slug: 'yardim',
    description: 'Teknik sorunlar ve öneriler için destek alanı',
  },
];

const forums: ForumForum[] = [
  {
    id: 'forum-1',
    category_id: 'cat-1',
    name: 'Site Duyuruları',
    slug: 'site-duyurulari',
    description: 'Yeni özellikler ve topluluk bilgilendirmeleri',
    thread_count: 3,
  },
  {
    id: 'forum-2',
    category_id: 'cat-1',
    name: 'Topluluk Sohbeti',
    slug: 'topluluk-sohbeti',
    description: 'Genel sohbet ve tanışma konuları',
    thread_count: 4,
  },
  {
    id: 'forum-3',
    category_id: 'cat-2',
    name: 'Teknik Destek',
    slug: 'teknik-destek',
    description: 'Hatalar, geri bildirimler ve geliştirme önerileri',
    thread_count: 2,
  },
];

const threads: ForumThread[] = [
  {
    id: 'thr-1',
    forum_id: 'forum-1',
    category_id: 'cat-1',
    title: 'Forum kuralları ve Google doğrulaması',
    body: 'Topluluğu güvenli tutmak için Google doğrulamasını zorunlu kıldık. Kuralları okuyun ve geri bildirimlerinizi paylaşın.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    slug: 'forum-kurallari-ve-google-dogrulamasi',
    status: 'open',
    reply_count: 3,
    view_count: 124,
    google_connected: true,
  },
  {
    id: 'thr-2',
    forum_id: 'forum-2',
    category_id: 'cat-1',
    title: 'Yeni katılanlara hoş geldin!',
    body: 'Kendinizi tanıtın, ekipten beklentilerinizi yazın ve yeni özellik isteklerinizi ekleyin.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    slug: 'yeni-katilanlara-hos-geldin',
    status: 'in_progress',
    reply_count: 5,
    view_count: 82,
  },
  {
    id: 'thr-3',
    forum_id: 'forum-3',
    category_id: 'cat-2',
    title: 'Mobil performans optimizasyonu',
    body: 'Sayfa geçişlerinde gecikme yaşayan var mı? Deneyimlerinizi ve cihaz bilgilerinizi paylaşın.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    slug: 'mobil-performans-optimizasyonu',
    status: 'resolved',
    reply_count: 1,
    view_count: 56,
  },
  {
    id: 'thr-4',
    forum_id: 'forum-2',
    category_id: 'cat-1',
    title: 'Video önerileri için yeni alt forum',
    body: 'Video fikirlerini derli toplu paylaşabileceğimiz bir alt forum açmayı planlıyoruz. Önerilerinizi yazın.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    slug: 'video-onerileri-icin-yeni-alt-forum',
    status: 'open',
    reply_count: 0,
    view_count: 37,
  },
];

const replies: ForumReply[] = [
  {
    id: 'rep-1',
    thread_id: 'thr-1',
    author_email: 'moderatorkamil@example.com',
    body: 'Kuralları güncelledim, eklemek istediğiniz maddeler varsa yazın.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    is_solution: false,
  },
  {
    id: 'rep-2',
    thread_id: 'thr-1',
    author_email: 'ziyaretci@example.com',
    body: 'Google doğrulaması sorunsuz çalışıyor, teşekkürler.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    is_solution: true,
  },
  {
    id: 'rep-3',
    thread_id: 'thr-2',
    author_email: 'melis@example.com',
    body: 'Hoş bulduk! Topluluk buluşmaları planlıyor musunuz?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
];

function attachRelations(thread: ForumThread): ForumThread {
  return {
    ...thread,
    category: categories.find((category) => category.id === thread.category_id),
    forum: forums.find((forum) => forum.id === thread.forum_id),
  };
}

export async function getForumCategoriesWithForums() {
  const data = categories.map((category) => ({
    ...category,
    forums: forums.filter((forum) => forum.category_id === category.id),
  }));
  return { data, error: null as NullableError };
}

export async function getForumCategoryBySlug(categorySlug: string) {
  const category = categories.find((item) => item.slug === categorySlug) || null;
  return { data: category, error: category ? null : { message: 'Kategori bulunamadı' } } as const;
}

export async function getForumBySlugs(categorySlug: string, forumSlug: string) {
  const category = categories.find((item) => item.slug === categorySlug);
  const forum = forums.find((item) => item.slug === forumSlug && item.category_id === category?.id) || null;
  return { data: forum, error: forum ? null : { message: 'Forum bulunamadı' } } as const;
}

export async function getForumsForCategory(categorySlug: string) {
  const category = categories.find((item) => item.slug === categorySlug);
  const data = category ? forums.filter((forum) => forum.category_id === category.id) : [];
  return { data, error: category ? null : { message: 'Kategori bulunamadı' } } as const;
}

export async function getThreadsForForum(forumSlug: string) {
  const forum = forums.find((item) => item.slug === forumSlug);
  const data = forum ? threads.filter((thread) => thread.forum_id === forum.id).map(attachRelations) : [];
  return { data, error: forum ? null : { message: 'Forum bulunamadı' } } as const;
}

export async function getForumThreadById(id: string) {
  const thread = threads.find((item) => item.id === id);
  return { data: thread ? attachRelations(thread) : null, error: thread ? null : { message: 'Konu bulunamadı' } } as const;
}

export async function getForumReplies(threadId: string) {
  return { data: replies.filter((reply) => reply.thread_id === threadId), error: null as NullableError };
}

export function buildThreadPath(thread: ForumThread) {
  const slug = thread.slug || slugify(thread.title);
  return `/forum/konu/${slug}-${thread.id}`;
}

export async function getLatestThreads(limit = 6) {
  const data = threads
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map(attachRelations);

  return { data, error: null as NullableError };
}

export function getSimilarThreads({
  forumId,
  categoryId,
  excludeId,
  limit = 5,
}: {
  forumId?: string;
  categoryId?: string;
  excludeId?: string;
  limit?: number;
}) {
  return threads
    .filter((thread) =>
      thread.id === excludeId ? false : forumId ? thread.forum_id === forumId : categoryId ? thread.category_id === categoryId : true
    )
    .slice(0, limit)
    .map(attachRelations);
}

export async function getUnansweredThreads(limit = 10) {
  const data = threads
    .filter((thread) => !replies.some((reply) => reply.thread_id === thread.id))
    .slice(0, limit)
    .map(attachRelations);
  return { data, error: null as NullableError };
}

export async function getUserForumRole(userId: string) {
  if (!userId) return 'user' as const;
  if (userId.includes('admin')) return 'admin' as const;
  if (userId.includes('mod')) return 'moderator' as const;
  return 'user' as const;
}

export async function incrementThreadViewCount(threadId: string) {
  const thread = threads.find((item) => item.id === threadId);
  if (thread) {
    thread.view_count = (thread.view_count || 0) + 1;
  }
  return { data: thread ? attachRelations(thread) : null, error: thread ? null : { message: 'Konu bulunamadı' } } as const;
}

export async function markThreadSolved(threadId: string, replyId: string) {
  const thread = threads.find((item) => item.id === threadId);
  const reply = replies.find((item) => item.id === replyId);
  if (thread && reply) {
    replies.forEach((item) => {
      if (item.thread_id === threadId) item.is_solution = false;
    });
    reply.is_solution = true;
    thread.status = 'resolved';
    return { data: { thread: attachRelations(thread), reply }, error: null as NullableError } as const;
  }
  return { data: null, error: { message: 'Çözüm güncellenemedi' } } as const;
}

export async function createForumReply(threadId: string, body: string, authorEmail?: string) {
  const thread = threads.find((item) => item.id === threadId);
  if (!thread) return { data: null, error: { message: 'Konu bulunamadı' } } as const;

  const newReply: ForumReply = {
    id: `rep-${Date.now()}`,
    thread_id: threadId,
    author_email: authorEmail || 'Google kullanıcısı',
    body,
    created_at: new Date().toISOString(),
    is_solution: false,
  };

  replies.push(newReply);
  thread.reply_count = (thread.reply_count || 0) + 1;

  return { data: newReply, error: null as NullableError } as const;
}

export async function createForumThread({
  title,
  body,
  categorySlug,
  forumSlug,
  authorEmail,
}: {
  title: string;
  body: string;
  categorySlug: string;
  forumSlug: string;
  authorEmail?: string;
}) {
  const category = categories.find((item) => item.slug === categorySlug);
  const forum = forums.find((item) => item.slug === forumSlug && item.category_id === category?.id);
  if (!category || !forum) return { data: null, error: { message: 'Kategori veya forum bulunamadı' } } as const;

  const thread: ForumThread = {
    id: `thr-${Date.now()}`,
    forum_id: forum.id,
    category_id: category.id,
    title,
    body,
    slug: slugify(title),
    created_at: new Date().toISOString(),
    status: 'open',
    reply_count: 0,
    view_count: 0,
  };

  threads.unshift(thread);
  forum.thread_count = (forum.thread_count || 0) + 1;

  return { data: attachRelations(thread), error: null as NullableError } as const;
}
