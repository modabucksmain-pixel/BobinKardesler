import { supabase } from './supabase';

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  youtube_video_id: string | null;
  github_url: string | null;
  thumbnail_url: string;
  components: string | null;
  featured: boolean;
  views: number;
  likes: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }

  return data || [];
}

export async function getProjectsByCategory(category: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }

  return data || [];
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  if (data) {
    await supabase
      .from('projects')
      .update({ views: data.views + 1 })
      .eq('id', id);
  }

  return data;
}

export async function incrementProjectLikes(id: string) {
  const { data } = await supabase
    .from('projects')
    .select('likes')
    .eq('id', id)
    .maybeSingle();

  if (data) {
    await supabase
      .from('projects')
      .update({ likes: data.likes + 1 })
      .eq('id', id);
  }
}

export const difficultyLabels = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

export const difficultyColors = {
  beginner: 'text-green-500',
  intermediate: 'text-yellow-500',
  advanced: 'text-red-500',
};
