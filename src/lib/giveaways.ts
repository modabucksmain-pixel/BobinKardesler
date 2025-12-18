import { supabase } from './supabase';

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  winner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  winner_name?: string;
  winner_email?: string;
}

export interface GiveawayParticipant {
  id: string;
  giveaway_id: string;
  name: string;
  email: string;
  participated_at: string;
}

export async function getActiveGiveaways(): Promise<Giveaway[]> {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('status', 'active')
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching giveaways:', error);
    return [];
  }

  const giveawaysWithCounts = await Promise.all(
    (data || []).map(async (giveaway) => {
      const { count } = await supabase
        .from('giveaway_participants')
        .select('*', { count: 'exact', head: true })
        .eq('giveaway_id', giveaway.id);

      return {
        ...giveaway,
        participant_count: count || 0,
      };
    })
  );

  return giveawaysWithCounts;
}

export async function getAllGiveaways(): Promise<Giveaway[]> {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all giveaways:', error);
    return [];
  }

  const giveawaysWithDetails = await Promise.all(
    (data || []).map(async (giveaway) => {
      const { count } = await supabase
        .from('giveaway_participants')
        .select('*', { count: 'exact', head: true })
        .eq('giveaway_id', giveaway.id);

      let winner_name = null;
      let winner_email = null;

      if (giveaway.winner_id) {
        const { data: winnerData } = await supabase
          .from('giveaway_participants')
          .select('name, email')
          .eq('id', giveaway.winner_id)
          .maybeSingle();

        if (winnerData) {
          winner_name = winnerData.name;
          winner_email = winnerData.email;
        }
      }

      return {
        ...giveaway,
        participant_count: count || 0,
        winner_name,
        winner_email,
      };
    })
  );

  return giveawaysWithDetails;
}

export async function participateInGiveaway(
  giveawayId: string,
  name: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('giveaway_participants').insert({
    giveaway_id: giveawayId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Bu e-posta adresi ile zaten katıldınız!' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getGiveawayParticipants(giveawayId: string): Promise<GiveawayParticipant[]> {
  const { data, error } = await supabase
    .from('giveaway_participants')
    .select('*')
    .eq('giveaway_id', giveawayId)
    .order('participated_at', { ascending: false });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return data || [];
}

export async function selectRandomWinner(giveawayId: string): Promise<{ success: boolean; winner?: GiveawayParticipant; error?: string }> {
  const participants = await getGiveawayParticipants(giveawayId);

  if (participants.length === 0) {
    return { success: false, error: 'Henüz katılımcı yok!' };
  }

  const randomIndex = Math.floor(Math.random() * participants.length);
  const winner = participants[randomIndex];

  const { error } = await supabase
    .from('giveaways')
    .update({
      winner_id: winner.id,
      status: 'completed',
    })
    .eq('id', giveawayId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, winner };
}
