import { supabase } from './supabase';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isVertical?: boolean;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  durationSeconds?: number;
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

  if (!data?.value) return null;

  if (typeof data.value === 'string') {
    return data.value;
  }

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

  if (!data?.value) return null;

  if (typeof data.value === 'string') {
    return data.value;
  }

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

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function getPreferredThumbnail(thumbnails: any): { url: string; width?: number; height?: number } {
  const preferenceOrder = ['maxres', 'standard', 'high', 'medium', 'default'];
  for (const key of preferenceOrder) {
    const option = thumbnails?.[key];
    if (option?.url) {
      return { url: option.url, width: option.width, height: option.height };
    }
  }

  return { url: '' };
}

export async function getLatestVideos(maxResults: number = 12): Promise<YouTubeVideo[]> {
  const cached = await getCachedData<YouTubeVideo[]>('latest_videos');
  if (cached?.length) return cached;

  const apiKey = await getYouTubeApiKey();
  const channelId = await getYouTubeChannelId();

  console.log('YouTube API Key:', apiKey ? 'Found' : 'Not found');
  console.log('YouTube Channel ID:', channelId || 'Not found');

  if (!apiKey || !channelId) {
    console.error('Missing YouTube credentials');
    return [];
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
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) throw new Error('Failed to fetch video details');

    const videosData = await videosResponse.json();

    const videos: YouTubeVideo[] =
      videosData.items?.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        ...(() => {
          const thumbnail = getPreferredThumbnail(item.snippet.thumbnails);
          const isVertical =
            typeof thumbnail.width === 'number' && typeof thumbnail.height === 'number'
              ? thumbnail.height > thumbnail.width
              : false;

          return {
            thumbnail: thumbnail.url,
            isVertical,
          };
        })(),
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics.viewCount || '0',
        likeCount: item.statistics.likeCount || '0',
        commentCount: item.statistics.commentCount || '0',
        durationSeconds: parseDurationToSeconds(item.contentDetails?.duration || ''),
      })) || [];

    await setCachedData('latest_videos', videos);
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
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
