import { supabase } from './supabase';

function getUserIdentifier(): string {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    identifier = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('user_identifier', identifier);
  }
  return identifier;
}

export async function addBookmark(contentType: 'video' | 'blog_post', contentId: string, notes?: string) {
  const userId = getUserIdentifier();

  const { error } = await supabase.from('user_bookmarks').insert({
    user_id: userId,
    content_type: contentType,
    content_id: contentId,
    notes: notes || null,
  });

  return { error };
}

export async function removeBookmark(contentType: 'video' | 'blog_post', contentId: string) {
  const userId = getUserIdentifier();

  const { error } = await supabase
    .from('user_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId);

  return { error };
}

export async function getBookmarks(contentType?: 'video' | 'blog_post') {
  const userId = getUserIdentifier();

  let query = supabase
    .from('user_bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  const { data, error } = await query;

  if (error) return [];
  return data || [];
}

export async function isBookmarked(contentType: 'video' | 'blog_post', contentId: string): Promise<boolean> {
  const userId = getUserIdentifier();

  const { data } = await supabase
    .from('user_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .maybeSingle();

  return !!data;
}
