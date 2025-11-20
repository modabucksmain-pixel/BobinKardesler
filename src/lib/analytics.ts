import { supabase } from './supabase';

export async function trackEvent(eventType: string, metadata: Record<string, any> = {}) {
  await supabase.from('site_analytics').insert({
    event_type: eventType,
    metadata,
  });
}

export async function trackPageView(pagePath: string) {
  await trackEvent('page_view', { path: pagePath });
}

export async function trackVideoClick(videoId: string, videoTitle: string) {
  await trackEvent('video_click', { video_id: videoId, title: videoTitle });
}

export async function trackBlogView(blogPostId: string, blogTitle: string) {
  await trackEvent('blog_view', { blog_post_id: blogPostId, title: blogTitle });
}

export async function trackSearch(query: string, resultsCount: number) {
  await trackEvent('search', { query, results_count: resultsCount });
}
