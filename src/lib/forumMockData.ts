import { slugify } from './slug';
import type { ForumCategory, ForumForum, ForumReply, ForumStatus, ForumThread } from './forumTypes';

type MockStore = {
  categories: ForumCategory[];
  forums: ForumForum[];
  threads: ForumThread[];
  replies: ForumReply[];
};

const STORAGE_KEY = 'bk-forum-mock-store-v1';

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

const defaultStore: MockStore = buildDefaultStore();

function buildDefaultStore(): MockStore {
  const now = new Date();
  const categories: ForumCategory[] = [
    {
      id: 'cat-duyurular',
      name: 'Duyurular',
      slug: 'duyurular',
      description: 'Bobin Kardeşler ekibinden resmi açıklamalar, kurallar ve rehberler.',
      created_at: now.toISOString(),
    },
    {
      id: 'cat-genel-elektronik',
      name: 'Genel Elektronik',
      slug: 'genel-elektronik',
      description: 'Temel sorular, güvenlik ve pasif komponent odaklı tartışmalar.',
      created_at: now.toISOString(),
    },
    {
      id: 'cat-projeler',
      name: 'Projeler ve Uygulamalar',
      slug: 'projeler-ve-uygulamalar',
      description: 'Arduino, güç elektroniği ve öğrenci projelerini paylaş.',
      created_at: now.toISOString(),
    },
    {
      id: 'cat-bilgisayar',
      name: 'Bilgisayar & Yazılım',
      slug: 'bilgisayar-ve-yazilim',
      description: 'Donanım, yazılım, hata giderme ve kodlama sohbetleri.',
      created_at: now.toISOString(),
    },
    {
      id: 'cat-off-topic',
      name: 'Sohbet & Off-Topic',
      slug: 'sohbet-ve-off-topic',
      description: 'Günlük sohbetler, mizah ve site geri bildirimleri.',
      created_at: now.toISOString(),
    },
  ];

  const forums: ForumForum[] = [
    { id: 'forum-site-duyurulari', category_id: 'cat-duyurular', name: 'Site Duyuruları', slug: 'site-duyurulari', description: 'Yeni özellikler, bakım ve güncellemeler', created_at: now.toISOString() },
    { id: 'forum-kurallar', category_id: 'cat-duyurular', name: 'Kurallar ve Rehberler', slug: 'kurallar-ve-rehberler', description: 'Topluluk kuralları ve yazım rehberleri', created_at: now.toISOString() },

    { id: 'forum-temel-elektronik', category_id: 'cat-genel-elektronik', name: 'Temel Elektronik Soruları', slug: 'temel-elektronik-sorulari', description: 'Yeni başlayanlar için temel sorular', created_at: now.toISOString() },
    { id: 'forum-elektrik-tesisati', category_id: 'cat-genel-elektronik', name: 'Elektrik Tesisatı ve Güvenlik', slug: 'elektrik-tesisati-ve-guvenlik', description: 'Topraklama, sigorta ve güvenlik önlemleri', created_at: now.toISOString() },
    { id: 'forum-pasif-elemanlar', category_id: 'cat-genel-elektronik', name: 'Pasif Devre Elemanları', slug: 'pasif-devre-elemanlari', description: 'Direnç, kondansatör, bobin, filtre tartışmaları', created_at: now.toISOString() },

    { id: 'forum-arduino', category_id: 'cat-projeler', name: 'Arduino / ESP / Mikrodenetleyici Projeleri', slug: 'arduino-esp-mikrodenetleyici', description: 'UNO, Nano, ESP8266/32 projeleri', created_at: now.toISOString() },
    { id: 'forum-guc-elektronigi', category_id: 'cat-projeler', name: 'Güç Elektroniği Projeleri', slug: 'guc-elektronigi-projeleri', description: 'SMPS, inverter, motor sürücüler', created_at: now.toISOString() },
    { id: 'forum-ogrenci', category_id: 'cat-projeler', name: 'Öğrenci Projeleri (Lise / Üniversite)', slug: 'ogrenci-projeleri', description: 'Ödevler ve yarışma projeleri', created_at: now.toISOString() },

    { id: 'forum-donanım', category_id: 'cat-bilgisayar', name: 'Donanım', slug: 'donanim', description: 'PC toplamadan bileşen uyumuna', created_at: now.toISOString() },
    { id: 'forum-yazilim', category_id: 'cat-bilgisayar', name: 'Yazılım ve Programlama', slug: 'yazilim-ve-programlama', description: 'Kodlama, IDE, versiyon kontrol', created_at: now.toISOString() },
    { id: 'forum-hata-giderme', category_id: 'cat-bilgisayar', name: 'Hata Giderme (Troubleshooting)', slug: 'hata-giderme', description: 'Mavi ekran, performans ve sürücü sorunları', created_at: now.toISOString() },

    { id: 'forum-genel-sohbet', category_id: 'cat-off-topic', name: 'Genel Sohbet', slug: 'genel-sohbet', description: 'Günlük hayattan sohbetler', created_at: now.toISOString() },
    { id: 'forum-mizah', category_id: 'cat-off-topic', name: 'Mizah, Eğlence', slug: 'mizah-eglence', description: 'Mizah, caps ve eğlenceli paylaşımlar', created_at: now.toISOString() },
    { id: 'forum-oneri', category_id: 'cat-off-topic', name: 'Öneri ve Geri Bildirim', slug: 'oneri-ve-geri-bildirim', description: 'Site için öneriler, hata bildirimleri', created_at: now.toISOString() },
  ];

  const threads: ForumThread[] = [
    makeThread({
      id: 'th-smps',
      forum_id: 'forum-guc-elektronigi',
      title: 'AC-DC SMPS tasarımında bobin seçimi',
      body: '250W SMPS tasarlıyorum. Bobin nüvesi ve tel kalınlığı için öneri arıyorum. EMI gürültüsünü azaltmak için neler önerirsiniz?',
      tags: ['AC-DC', 'SMPS', 'bobin'],
      status: 'open',
      view_count: 142,
    }),
    makeThread({
      id: 'th-esp',
      forum_id: 'forum-arduino',
      title: 'ESP8266 Wi-Fi bağlantısı kopuyor',
      body: 'Modülü derste gösteri için kullanıyorum fakat laboratuvardaki modemle bağlantı kopuyor. Güç beslemesi ve anten konusunda neler deneyebilirim?',
      tags: ['ESP8266', 'Wi-Fi', 'anten'],
      status: 'in_progress',
      view_count: 221,
    }),
    makeThread({
      id: 'th-ground',
      forum_id: 'forum-elektrik-tesisati',
      title: 'Atölyede topraklama kontrolü',
      body: 'Yeni atölye kuruyorum. Kaçak akım rolesi seçimi ve topraklama ölçümü için hangi cihazları önerirsiniz?',
      tags: ['topraklama', 'güvenlik'],
      status: 'resolved',
      view_count: 310,
      solution_reply_id: 'rep-ground-1',
    }),
    makeThread({
      id: 'th-caps',
      forum_id: 'forum-pasif-elemanlar',
      title: 'Kondansatör ESR ölçümü için pratik yöntem',
      body: 'ESR metre yoksa multimetre ve sinyal jeneratörü ile yaklaşım nasıl olmalı? Laboratuvar ortamında hızlı kontrol için öneriler.',
      tags: ['kondansatör', 'ESR'],
      status: 'open',
      view_count: 88,
    }),
    makeThread({
      id: 'th-bsod',
      forum_id: 'forum-hata-giderme',
      title: 'Windows 11 mavi ekran: DRIVER_IRQL_NOT_LESS_OR_EQUAL',
      body: 'Yeni NVMe diskte temiz kurulum yaptım. Bazen mavi ekran veriyor. Sürücü çakışması olabilir mi, minidump analizini nasıl yaparım?',
      tags: ['windows', 'bsod', 'nvme'],
      status: 'open',
      view_count: 412,
    }),
    makeThread({
      id: 'th-led',
      forum_id: 'forum-ogrenci',
      title: 'Lise projesi: adreslenebilir LED müzik görselleştirici',
      body: 'WS2812 şerit ile mikrofon girişini okuyarak müzik görselleştirme yapmak istiyorum. Ses filtreleme ve güç dağıtımı konusunda tavsiye?',
      tags: ['WS2812', 'arduino', 'ses'],
      status: 'in_progress',
      view_count: 156,
    }),
  ];

  const replies: ForumReply[] = [
    makeReply({ id: 'rep-smps-1', thread_id: 'th-smps', body: 'EMI için giriş filtresine X2 kondansatör ve common-mode choke eklemeyi unutma. Ayrıca snubber devresini test et.' }),
    makeReply({ id: 'rep-smps-2', thread_id: 'th-smps', body: 'Nüve için ETD39 yeterli olabilir, 100kHz altına inmeye çalışırsan kayıplar düşer.' }),
    makeReply({ id: 'rep-esp-1', thread_id: 'th-esp', body: '3.3V regülatörünü 1A kapasiteye çıkar, anteni dışarı çıkarıp yönlendirmeyi dene.' }),
    makeReply({ id: 'rep-ground-1', thread_id: 'th-ground', body: 'Topraklama çubuğunu en az 1.5m derine göm, kaçak akım rolesinde 30mA hassasiyet kullan. Megger ile ölçüm yapabilirsin.', is_solution: true }),
    makeReply({ id: 'rep-led-1', thread_id: 'th-led', body: 'Ses için MSGEQ7 kullan ya da FFT yap. 5V beslemeye mutlaka büyük elektrolit ekle.' }),
  ];

  return { categories, forums, threads, replies };
}

function loadStore(): MockStore {
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) {
      return JSON.parse(fromStorage) as MockStore;
    }
  } catch (error) {
    console.warn('Mock store okunamadı', error);
  }
  saveStore(defaultStore);
  return { ...defaultStore };
}

function saveStore(store: MockStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn('Mock store kaydedilemedi', error);
  }
}

function makeThread(partial: Partial<ForumThread> & Pick<ForumThread, 'forum_id' | 'title' | 'body' | 'tags' | 'status'>): ForumThread {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? uuid(),
    forum_id: partial.forum_id,
    title: partial.title,
    slug: partial.slug ?? slugify(partial.title),
    body: partial.body,
    tags: partial.tags,
    status: partial.status as ForumStatus,
    created_by: partial.created_by ?? 'mock-user',
    created_by_email: partial.created_by_email ?? 'destek@bobinkardesler.com',
    google_connected: true,
    solution_reply_id: partial.solution_reply_id ?? null,
    last_activity_at: partial.last_activity_at ?? now,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
    view_count: partial.view_count ?? 0,
    is_locked: partial.is_locked ?? false,
    reply_count: partial.reply_count ?? 0,
  };
}

function makeReply(partial: Partial<ForumReply> & Pick<ForumReply, 'thread_id' | 'body'>): ForumReply {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? uuid(),
    thread_id: partial.thread_id,
    body: partial.body,
    author_id: partial.author_id ?? 'mock-user',
    author_email: partial.author_email ?? 'destek@bobinkardesler.com',
    is_admin_response: partial.is_admin_response ?? false,
    is_solution: partial.is_solution ?? false,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
  };
}

export function getMockCategories(): (ForumCategory & { forums: ForumForum[] })[] {
  const store = loadStore();
  return store.categories.map((category) => ({
    ...category,
    forums: store.forums
      .filter((forum) => forum.category_id === category.id)
      .map((forum) => ({
        ...forum,
        thread_count: store.threads.filter((t) => t.forum_id === forum.id).length,
      })),
  }));
}

export function getMockCategory(slug: string): (ForumCategory & { forums: ForumForum[] }) | null {
  const store = loadStore();
  const category = store.categories.find((c) => c.slug === slug);
  if (!category) return null;
  return {
    ...category,
    forums: store.forums.filter((forum) => forum.category_id === category.id).map((forum) => ({
      ...forum,
      thread_count: store.threads.filter((t) => t.forum_id === forum.id).length,
    })),
  };
}

export function getMockForum(categorySlug: string, forumSlug: string): ForumForum | null {
  const store = loadStore();
  const category = store.categories.find((c) => c.slug === categorySlug);
  if (!category) return null;
  const forum = store.forums.find((f) => f.slug === forumSlug && f.category_id === category.id);
  return forum ? { ...forum, category } : null;
}

export function getMockThreads(forumId: string): ForumThread[] {
  const store = loadStore();
  const threads = forumId === 'all' ? store.threads : store.threads.filter((t) => t.forum_id === forumId);
  return threads
    .map((thread) => ({
      ...thread,
      reply_count: store.replies.filter((r) => r.thread_id === thread.id).length,
      forum: store.forums.find((f) => f.id === thread.forum_id),
      category: (() => {
        const forum = store.forums.find((f) => f.id === thread.forum_id);
        if (!forum) return undefined;
        return store.categories.find((c) => c.id === forum.category_id);
      })(),
    }))
    .sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime());
}

export function getMockThread(threadId: string): ForumThread | null {
  const store = loadStore();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  const forum = store.forums.find((f) => f.id === thread.forum_id);
  const category = forum ? store.categories.find((c) => c.id === forum.category_id) : undefined;
  return {
    ...thread,
    reply_count: store.replies.filter((r) => r.thread_id === thread.id).length,
    forum,
    category,
  };
}

export function getMockReplies(threadId: string): ForumReply[] {
  const store = loadStore();
  return store.replies
    .filter((reply) => reply.thread_id === threadId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function addMockThread(thread: Omit<ForumThread, 'id'> & { id?: string }): ForumThread {
  const store = loadStore();
  const newThread = makeThread({ ...thread, id: thread.id ?? uuid() });
  store.threads.push(newThread);
  saveStore(store);
  return newThread;
}

export function addMockReply(reply: Omit<ForumReply, 'id'> & { id?: string }): ForumReply {
  const store = loadStore();
  const newReply = makeReply({ ...reply, id: reply.id ?? uuid() });
  store.replies.push(newReply);
  const threadIndex = store.threads.findIndex((t) => t.id === reply.thread_id);
  if (threadIndex >= 0) {
    store.threads[threadIndex].last_activity_at = newReply.created_at;
    store.threads[threadIndex].updated_at = newReply.updated_at;
    store.threads[threadIndex].reply_count = (store.threads[threadIndex].reply_count ?? 0) + 1;
  }
  saveStore(store);
  return newReply;
}

export function markMockSolution(threadId: string, replyId: string) {
  const store = loadStore();
  const threadIndex = store.threads.findIndex((t) => t.id === threadId);
  if (threadIndex === -1) return;
  store.threads[threadIndex].status = 'resolved';
  store.threads[threadIndex].solution_reply_id = replyId;
  store.threads[threadIndex].is_locked = true;
  store.replies = store.replies.map((reply) => ({
    ...reply,
    is_solution: reply.id === replyId,
  }));
  saveStore(store);
}

export function incrementMockView(threadId: string) {
  const store = loadStore();
  const threadIndex = store.threads.findIndex((t) => t.id === threadId);
  if (threadIndex === -1) return;
  store.threads[threadIndex].view_count += 1;
  saveStore(store);
}

export function getMockRole(userId: string): 'admin' | 'moderator' | 'user' {
  if (userId?.includes('mod')) return 'moderator';
  return 'admin';
}
