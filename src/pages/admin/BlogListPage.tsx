import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Edit, Trash2, Eye, Calendar, Plus, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../lib/youtube';
import { useNotification } from '../../contexts/NotificationContext';

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
  const { success, error: showError } = useNotification();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

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
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status, published_at, views')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Blog yazıları yüklenemedi: ' + error.message);
    } else if (data) {
      setPosts(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      showError('Yazı silinemedi: ' + error.message);
      return;
    }

    setPosts(posts.filter((post) => post.id !== id));
    success('Yazı silindi');
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (error) {
      showError('Yayın durumu güncellenemedi: ' + error.message);
      return;
    }

    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)));
    success(newStatus === 'published' ? 'Yazı yayına alındı' : 'Yazı taslağa çekildi');
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Başlıkta ara..."
                className="flex-1 min-w-[220px] px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
              <div className="flex items-center gap-2">
                {(
                  [
                    { label: 'Tümü', value: 'all' },
                    { label: 'Yayında', value: 'published' },
                    { label: 'Taslak', value: 'draft' },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-green-500 text-zinc-950 border-green-400'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-green-400/40'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm text-zinc-400">
              <div className="px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                Toplam: {posts.length}
              </div>
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300">
                Filtreli: {filteredPosts.length}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-24"></div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
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
            {filteredPosts.map((post) => (
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
                  <button
                    onClick={() => togglePublish(post)}
                    className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                    title={post.status === 'published' ? 'Taslağa çek' : 'Yayınla'}
                  >
                    {post.status === 'published' ? 'Taslağa Al' : 'Yayınla'}
                  </button>
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
