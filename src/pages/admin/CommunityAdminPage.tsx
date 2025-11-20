import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Plus, Edit, Trash2, Eye, Pin, ArrowLeft } from 'lucide-react';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  pinned: boolean;
  views: number;
  created_at: string;
}

export function CommunityAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadPosts();
    }
  }, [user, authLoading]);

  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('community_posts').delete().eq('id', id);

    if (!error) {
      loadPosts();
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    await supabase
      .from('community_posts')
      .update({ published: !currentStatus })
      .eq('id', id);

    loadPosts();
  }

  async function togglePinned(id: string, currentStatus: boolean) {
    await supabase
      .from('community_posts')
      .update({ pinned: !currentStatus })
      .eq('id', id);

    loadPosts();
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard'a Dön</span>
          </a>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Topluluk Duyuruları</h1>
              <p className="text-zinc-400">Duyuruları yönetin</p>
            </div>
            <button
              onClick={() => {
                setEditingPost(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Duyuru</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz duyuru yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-zinc-100">{post.title}</h3>
                      {post.pinned && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-semibold flex items-center space-x-1">
                          <Pin className="w-3 h-3" />
                          <span>Sabit</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          post.published
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {post.published ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views} görüntülenme</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePinned(post.id, post.pinned)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.pinned
                          ? 'text-green-500 hover:text-green-400'
                          : 'text-zinc-400 hover:text-green-500'
                      }`}
                      title={post.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                    >
                      <Pin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => togglePublished(post.id, post.published)}
                      className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                      title={post.published ? 'Yayından Kaldır' : 'Yayınla'}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setShowModal(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PostModal
          post={editingPost}
          onClose={() => {
            setShowModal(false);
            setEditingPost(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingPost(null);
            loadPosts();
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

function PostModal({
  post,
  onClose,
  onSaved,
  userId,
}: {
  post: CommunityPost | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [imageUrl, setImageUrl] = useState('');
  const [contentType, setContentType] = useState<'html' | 'text'>('text');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let finalContent = content;
    if (contentType === 'text') {
      finalContent = `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }

    if (post) {
      await supabase
        .from('community_posts')
        .update({ title, content: finalContent, updated_at: new Date().toISOString() })
        .eq('id', post.id);
    } else {
      await supabase.from('community_posts').insert({
        title,
        content: finalContent,
        image_url: imageUrl || null,
        author_id: userId,
        published: false,
      });
    }

    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-6">
          {post ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
            />
          </div>

          {!post && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Görsel URL (İsteğe bağlı)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">İçerik</label>
              <div className="flex items-center space-x-3 text-sm">
                <button
                  type="button"
                  onClick={() => setContentType('text')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    contentType === 'text'
                      ? 'bg-green-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Düz Metin
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('html')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    contentType === 'html'
                      ? 'bg-green-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  HTML
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              {contentType === 'text'
                ? 'Düz metin olarak yazın. Paragraflar otomatik formatlanacak.'
                : 'HTML etiketleri kullanarak yazın (örn: <p>, <strong>, <a>).'}
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className={`w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 text-sm resize-none ${
                contentType === 'html' ? 'font-mono' : ''
              }`}
              placeholder={contentType === 'text' ? 'Duyuru içeriğinizi buraya yazın...' : '<p>HTML içeriğinizi buraya yazın...</p>'}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
