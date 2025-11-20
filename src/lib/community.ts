import { supabase } from './supabase';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  published: boolean;
  pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export async function getCommunityPosts(limit?: number) {
  const query = supabase
    .from('community_posts')
    .select('*')
    .eq('published', true)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }

  return data || [];
}

export async function getCommunityPost(id: string) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching community post:', error);
    return null;
  }

  if (data) {
    await supabase
      .from('community_posts')
      .update({ views: data.views + 1 })
      .eq('id', id);
  }

  return data;
}

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'views' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error('Error creating community post:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function updateCommunityPost(id: string, updates: Partial<CommunityPost>) {
  const { data, error } = await supabase
    .from('community_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating community post:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteCommunityPost(id: string) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting community post:', error);
    return { success: false, error };
  }

  return { success: true };
}
