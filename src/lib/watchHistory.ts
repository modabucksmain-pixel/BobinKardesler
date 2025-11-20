import { supabase } from './supabase';

function getUserIdentifier(): string {
  let identifier = localStorage.getItem('user_identifier');

  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', identifier);
  }

  return identifier;
}

export async function markVideoAsWatched(videoId: string): Promise<void> {
  const userIdentifier = getUserIdentifier();

  await supabase
    .from('video_watch_history')
    .upsert(
      {
        video_id: videoId,
        user_identifier: userIdentifier,
        watched_at: new Date().toISOString(),
      },
      { onConflict: 'video_id,user_identifier' }
    );
}

export async function getWatchedVideos(): Promise<Set<string>> {
  const userIdentifier = getUserIdentifier();

  const { data, error } = await supabase
    .from('video_watch_history')
    .select('video_id')
    .eq('user_identifier', userIdentifier);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map(item => item.video_id));
}

export function isVideoWatched(videoId: string, watchedVideos: Set<string>): boolean {
  return watchedVideos.has(videoId);
}
