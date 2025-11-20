import { supabase } from './supabase';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
  unsubscribe_token: string;
}

export async function subscribeToNewsletter(email: string, name?: string) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name: name || null })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
    }
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
  }

  return { success: true, data };
}

export async function unsubscribeFromNewsletter(token: string) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('unsubscribe_token', token);

  if (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getAllSubscribers() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }

  return data || [];
}
