import { supabase } from './supabase';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface ChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

const CACHE_DURATION = 3600000;

async function getCachedData<T>(cacheKey: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('youtube_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    await supabase.from('youtube_cache').delete().eq('cache_key', cacheKey);
    return null;
  }

  return data.data as T;
}

async function setCachedData(cacheKey: string, data: any): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_DURATION).toISOString();

  await supabase
    .from('youtube_cache')
    .upsert(
      {
        cache_key: cacheKey,
        data,
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' }
    );
}

export async function getYouTubeApiKey(): Promise<string | null> {
  // First try from environment variable
  const envKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (envKey) return envKey;

  // Fallback to database
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'youtube_api_key')
    .maybeSingle();

  if (!data?.value || typeof data.value === 'string') return null;

  const valueObj = data.value as { api_key?: string };
  return valueObj.api_key || null;
}

export async function getYouTubeChannelId(): Promise<string | null> {
  // First try from environment variable
  const envChannelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  if (envChannelId) return envChannelId;

  // Fallback to database
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'youtube_channel_id')
    .maybeSingle();

  if (!data?.value || typeof data.value === 'string') return null;

  const valueObj = data.value as { channel_id?: string };
  return valueObj.channel_id || null;
}

export async function getChannelStats(): Promise<ChannelStats | null> {
  const cached = await getCachedData<ChannelStats>('channel_stats');
  if (cached) return cached;

  const apiKey = await getYouTubeApiKey();
  const channelId = await getYouTubeChannelId();

  if (!apiKey || !channelId) {
    return {
      subscriberCount: '0',
      viewCount: '0',
      videoCount: '0',
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );

    if (!response.ok) throw new Error('Failed to fetch channel stats');

    const data = await response.json();
    const stats = data.items?.[0]?.statistics;

    if (!stats) throw new Error('No stats found');

    const channelStats: ChannelStats = {
      subscriberCount: stats.subscriberCount || '0',
      viewCount: stats.viewCount || '0',
      videoCount: stats.videoCount || '0',
    };

    await setCachedData('channel_stats', channelStats);
    return channelStats;
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    return {
      subscriberCount: '0',
      viewCount: '0',
      videoCount: '0',
    };
  }
}

export async function getLatestVideos(maxResults: number = 12): Promise<YouTubeVideo[]> {
  const cached = await getCachedData<YouTubeVideo[]>('latest_videos');
  if (cached) return cached;

  const apiKey = await getYouTubeApiKey();
  const channelId = await getYouTubeChannelId();

  console.log('YouTube API Key:', apiKey ? 'Found' : 'Not found');
  console.log('YouTube Channel ID:', channelId || 'Not found');

  if (!apiKey || !channelId) {
    console.error('Missing YouTube credentials');
    return getMockVideos();
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`;
    console.log('Fetching videos from YouTube API...');

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube API Error:', errorData);
      throw new Error('Failed to fetch videos');
    }

    const searchData = await searchResponse.json();
    console.log('Search API Response:', searchData);
    console.log('Videos found:', searchData.items?.length || 0);

    if (!searchData.items || searchData.items.length === 0) {
      console.warn('No videos found for channel ID:', channelId);
      return [];
    }

    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');

    if (!videoIds) return [];

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) throw new Error('Failed to fetch video details');

    const videosData = await videosResponse.json();

    const videos: YouTubeVideo[] = videosData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount || '0',
      likeCount: item.statistics.likeCount || '0',
      commentCount: item.statistics.commentCount || '0',
    })) || [];

    await setCachedData('latest_videos', videos);
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return getMockVideos();
  }
}

function getMockVideos(): YouTubeVideo[] {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Arduino ile LED Kontrolü - Başlangıç Projesi',
      description: 'Arduino kullanarak basit LED kontrolü yapıyoruz. Yeni başlayanlar için mükemmel bir proje!',
      thumbnail: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '15420',
      likeCount: '892',
      commentCount: '143',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'ESP32 WiFi Modülü Kurulumu ve Kullanımı',
      description: 'ESP32 modülü ile WiFi bağlantısı kurma ve basit web server oluşturma.',
      thumbnail: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '23100',
      likeCount: '1240',
      commentCount: '201',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Raspberry Pi ile Akıllı Ev Sistemi',
      description: 'Raspberry Pi kullanarak kendi akıllı ev sisteminizi nasıl yapabilirsiniz?',
      thumbnail: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '31500',
      likeCount: '1680',
      commentCount: '287',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: '3D Yazıcı Kalibrasyonu - Kusursuz Baskı İçin',
      description: '3D yazıcınızı doğru kalibre ederek en iyi sonuçları nasıl alırsınız?',
      thumbnail: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '18900',
      likeCount: '1050',
      commentCount: '178',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'PCB Tasarımı - KiCad ile Başlangıç',
      description: 'KiCad kullanarak kendi PCB tasarımlarınızı oluşturun.',
      thumbnail: 'https://images.pexels.com/photos/5717971/pexels-photo-5717971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '12600',
      likeCount: '720',
      commentCount: '94',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Robot Kol Yapımı - Step by Step',
      description: 'Servo motorlar kullanarak fonksiyonel bir robot kol tasarlıyoruz.',
      thumbnail: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: '27300',
      likeCount: '1520',
      commentCount: '235',
    },
  ];
}

export function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }
  return n.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
}
