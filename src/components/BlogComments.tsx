import { useEffect, useState } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface Comment {
  id: string;
  content: string;
  author_name: string | null;
  user_id: string | null;
  created_at: string;
  parent_id: string | null;
}

interface BlogCommentsProps {
  blogPostId: string;
}

export function BlogComments({ blogPostId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    author_name: '',
  });
  const { user } = useAuth();
  const { success, error } = useNotification();

  useEffect(() => {
    loadComments();
  }, [blogPostId]);

  async function loadComments() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('blog_comments')
      .select('id, content, author_name, user_id, created_at, parent_id')
      .eq('blog_post_id', blogPostId)
      .eq('status', 'approved')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (!fetchError && data) {
      setComments(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.content.trim()) {
      error('Lütfen bir yorum yazın');
      return;
    }

    if (!user && !formData.author_name.trim()) {
      error('Lütfen isminizi girin');
      return;
    }

    setSubmitting(true);

    const { error: submitError } = await supabase.from('blog_comments').insert({
      blog_post_id: blogPostId,
      content: formData.content.trim(),
      author_name: user ? null : formData.author_name.trim(),
      user_id: user?.id || null,
    });

    setSubmitting(false);

    if (submitError) {
      error('Yorum gönderilemedi. Lütfen tekrar deneyin.');
    } else {
      success('Yorumunuz başarıyla gönderildi!');
      setFormData({ content: '', author_name: '' });
      loadComments();
    }
  }

  return (
    <div className="mt-16 pt-16 border-t border-zinc-800">
      <div className="flex items-center space-x-3 mb-8">
        <MessageCircle className="w-6 h-6 text-green-500" />
        <h2 className="text-2xl font-bold text-zinc-100">
          Yorumlar ({comments.length})
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Yorum Yap</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div>
              <label htmlFor="author_name" className="block text-sm font-medium text-zinc-300 mb-2">
                İsminiz *
              </label>
              <input
                type="text"
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                required={!user}
                placeholder="Adınız Soyadınız"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-zinc-300 mb-2">
              Yorumunuz *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              placeholder="Düşüncelerinizi paylaşın..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-zinc-950 font-bold rounded-lg hover:bg-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-lg border border-zinc-800">
          <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Henüz yorum yok. İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-zinc-100">
              {comment.author_name || 'Kullanıcı'}
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-500">
              {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
