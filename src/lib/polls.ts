import { supabase } from './supabase';

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  status: 'active' | 'closed';
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  position: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
  total_votes: number;
}

export async function getActivePolls() {
  const { data: polls, error } = await supabase
    .from('polls')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching polls:', error);
    return [];
  }

  const pollsWithOptions: PollWithOptions[] = [];

  for (const poll of polls || []) {
    const { data: options } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', poll.id)
      .order('position');

    const total_votes = options?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;

    pollsWithOptions.push({
      ...poll,
      options: options || [],
      total_votes,
    });
  }

  return pollsWithOptions;
}

export async function getPoll(id: string): Promise<PollWithOptions | null> {
  const { data: poll, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !poll) {
    console.error('Error fetching poll:', error);
    return null;
  }

  const { data: options } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', poll.id)
    .order('position');

  const total_votes = options?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;

  return {
    ...poll,
    options: options || [],
    total_votes,
  };
}

export async function voteOnPoll(pollId: string, optionId: string, userIp: string, fingerprint?: string) {
  const { data: existingVote } = await supabase
    .from('poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_ip', userIp)
    .maybeSingle();

  if (existingVote) {
    return { success: false, error: 'Already voted on this poll' };
  }

  const { error: voteError } = await supabase
    .from('poll_votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_ip: userIp,
      user_fingerprint: fingerprint,
    });

  if (voteError) {
    console.error('Error voting:', voteError);
    return { success: false, error: voteError };
  }

  const { error: updateError } = await supabase.rpc('increment_poll_vote', {
    option_id: optionId,
  });

  if (updateError) {
    console.error('Error updating vote count:', updateError);
  }

  return { success: true };
}

export async function hasUserVoted(pollId: string, userIp: string): Promise<boolean> {
  const { data } = await supabase
    .from('poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_ip', userIp)
    .maybeSingle();

  return !!data;
}
