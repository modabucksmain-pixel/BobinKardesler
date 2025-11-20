import { supabase } from './supabase';
import type { Database } from './database.types';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];

export type Announcement = AnnouncementRow;

const baseAnnouncementSelect = () =>
  supabase
    .from('announcements')
    .select('*')
    .order('priority', { ascending: false })
    .order('publish_at', { ascending: false });

export async function getPublishedAnnouncements(limit?: number) {
  const query = baseAnnouncementSelect()
    .eq('published', true)
    .lte('publish_at', new Date().toISOString());

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching announcements:', error);
    return [] as Announcement[];
  }

  return data || [];
}

export async function getAnnouncement(id: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }

  return data;
}

export async function createAnnouncement(payload: AnnouncementInsert) {
  const { data, error } = await supabase.from('announcements').insert(payload).select().single();

  if (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function updateAnnouncement(id: string, payload: AnnouncementUpdate) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating announcement:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error };
  }

  return { success: true };
}
