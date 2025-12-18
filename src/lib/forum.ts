import { supabase } from './supabase';

export type ForumStatus = 'open' | 'in_progress' | 'resolved';

export interface ForumThread {
  id: string;
  title: string;
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

const mockThreads: ForumThread[] = [
  {
    id: 'mock-1',
    title: 'ESP32 ile Wi-Fi bağlantısı kopuyor, nasıl stabil hale getirebilirim?',
    body: 'Evdeki router ile bağlantı 5-10 dakikada bir düşüyor. Güç kaynağını değiştirdim, firmware güncel ama sorun devam ediyor. Hangi kütüphane/ayar ile toparlayabilirim?',
    tags: ['iot', 'esp32', 'wifi'],
    status: 'in_progress',
    created_by: null,
    created_by_email: 'maker@technopat',
    google_connected: true,
    solution_reply_id: 'mock-r-2',
    last_activity_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    view_count: 148,
    is_locked: false,
    reply_count: 5,
  },
  {
    id: 'mock-2',
    title: 'UPS sonrası PC açılmıyor, güç hattında nelere bakmalıyım?',
    body: 'Servisten yeni gelen UPS ile denedikten sonra masaüstü hiç tepki vermiyor. Güç butonu LED yanıyor ama fanlar dönmüyor. Kart üzerinde hangi ölçümleri yapmalıyım?',
    tags: ['donanım', 'pc-tamir', 'güç'],
    status: 'open',
    created_by: null,
    created_by_email: 'poweruser@technopat',
    google_connected: false,
    solution_reply_id: null,
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    view_count: 86,
    is_locked: false,
    reply_count: 2,
  },
  {
    id: 'mock-3',
    title: '3D yazıcı nozzle tıkanması için kalıcı çözüm arıyorum',
    body: 'PLA baskılarda 3-4 saat sonra nozzle tıkanıyor. Filament kalınlığı ve sepet sıcaklığını kontrol ettim. Bowden tüpü yeni. Kalibrasyon için öneri var mı?',
    tags: ['3d-yazıcı', 'bakım', 'pla'],
    status: 'resolved',
    created_by: null,
    created_by_email: 'printguru@technopat',
    google_connected: true,
    solution_reply_id: 'mock-r-5',
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    view_count: 233,
    is_locked: true,
    reply_count: 8,
  },
];

const mockReplies: ForumReply[] = [
  {
    id: 'mock-r-1',
    thread_id: 'mock-1',
    body: 'Router loglarında "deauth" görünüyorsa kanal çakışması vardır. 1-6-11 dene, ESP32 tarafında `WiFi.setTxPower(WIFI_POWER_19_5dBm)` ile dengele.',
    author_id: null,
    author_email: 'networkfox@technopat',
    is_admin_response: false,
    is_solution: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'mock-r-2',
    thread_id: 'mock-1',
    body: 'ESP32 modemle WPA2/WPA3 karma modda sorun çıkarıyor. Routerı WPA2-PSK ya çekip `WiFi.config(INADDR_NONE)` ile DHCP renew aç, bu şekilde 2 saattir düşmedi.',
    author_id: null,
    author_email: 'admin@bobinkardesler.com',
    is_admin_response: true,
    is_solution: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'mock-r-3',
    thread_id: 'mock-2',
    body: '12V hattı var mı multimetre ile ölç, yoksa PSU korumaya düşmüş olabilir. Anakartta stand-by LED yanıyor mu kontrol et.',
    author_id: null,
    author_email: 'donanimmaster@technopat',
    is_admin_response: false,
    is_solution: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
  },
  {
    id: 'mock-r-4',
    thread_id: 'mock-2',
    body: 'PSU kablosunu doğrudan prize takınca açılıyor mu? UPS çıkışında sinyal kare dalga ise bazı PSU\'lar tetiklenmiyor.',
    author_id: null,
    author_email: 'admin@bobinkardesler.com',
    is_admin_response: true,
    is_solution: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'mock-r-5',
    thread_id: 'mock-3',
    body: 'Tıkanmayı PETG artığı tetikliyor. Nozzle temizliği sonrası sıcaklık eğrini 5C artırıp retract mesafesini 1.2mm düşür, Bowden bağlantısını PTFE coupler ile sabitle.',
    author_id: null,
    author_email: 'admin@bobinkardesler.com',
    is_admin_response: true,
    is_solution: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 62).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 62).toISOString(),
  },
];

export async function getForumThreads() {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*, forum_replies(count)')
    .order('last_activity_at', { ascending: false });

  if (error || !data) {
    console.error('Forum başlıkları alınırken hata:', error);
    return mockThreads;
  }

  return data.map((thread: any) => ({
    ...thread,
    reply_count: thread.forum_replies?.[0]?.count ?? 0,
  }));
}

export async function getForumReplies(threadId: string) {
  const { data, error } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('Yanıtlar alınırken hata:', error);
    return mockReplies.filter((reply) => reply.thread_id === threadId);
  }

  return data;
}

export async function createForumThread(
  thread: Omit<ForumThread, 'id' | 'created_at' | 'updated_at' | 'last_activity_at' | 'view_count' | 'reply_count'>
) {
  const now = new Date().toISOString();
  const payload = {
    ...thread,
    created_at: now,
    updated_at: now,
    last_activity_at: now,
  };

  const { data, error } = await supabase.from('forum_threads').insert(payload).select().single();

  if (error) {
    console.error('Forum başlığı oluşturulamadı:', error);
    return { success: false, error } as const;
  }

  return { success: true, data } as const;
}

export async function createForumReply(reply: Omit<ForumReply, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const payload = {
    ...reply,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('forum_replies').insert(payload).select().single();

  if (error) {
    console.error('Yanıt eklenemedi:', error);
    return { success: false, error } as const;
  }

  await supabase
    .from('forum_threads')
    .update({ last_activity_at: now })
    .eq('id', reply.thread_id);

  return { success: true, data } as const;
}

export async function markThreadSolved(threadId: string, replyId: string) {
  const { error } = await supabase
    .from('forum_threads')
    .update({
      status: 'resolved',
      solution_reply_id: replyId,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  if (error) {
    console.error('Çözüm işaretleme hatası:', error);
    return { success: false, error } as const;
  }

  await supabase
    .from('forum_replies')
    .update({ is_solution: true })
    .eq('id', replyId);

  return { success: true } as const;
}

export function getMockForumData() {
  return { threads: mockThreads, replies: mockReplies };
}
