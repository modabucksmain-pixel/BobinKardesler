import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Edit, Trash2, Eye, Calendar, Plus, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../lib/youtube';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  views: number;
}

export function BlogListPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
      .from('blog_posts')
      .select('id, title, slug, status, published_at, views')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (!error) {
      setPosts(posts.filter((post) => post.id !== id));
    }
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
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Blog Yazıları</h1>
              <p className="text-zinc-400">Tüm blog yazılarını yönetin</p>
            </div>
            <a
              href="/admin/blog/new"
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Yazı</span>
            </a>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-24"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz blog yazısı yok</p>
            <a
              href="/admin/blog/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>İlk Yazınızı Oluşturun</span>
            </a>
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
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          post.status === 'published'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {post.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.published_at
                            ? formatDate(post.published_at)
                            : 'Yayınlanmamış'}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views} görüntülenme</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`/admin/blog/${post.id}`}
                      className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </a>
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
    </div>
  );
}
