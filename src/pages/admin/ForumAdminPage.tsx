import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, MessageSquare, Plus, Save, Trash2, Edit } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../lib/slug';

interface ForumCategoryWithForums {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  forum_forums: Array<{
    id: string;
    category_id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    forum_threads?: Array<{ count: number } | null>;
  }>;
}

interface CategoryFormState {
  id: string | null;
  name: string;
  slug: string;
  description: string;
}

interface ForumFormState {
  id: string | null;
  category_id: string;
  name: string;
  slug: string;
  description: string;
}

export function ForumAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ForumCategoryWithForums[]>([]);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>({
    id: null,
    name: '',
    slug: '',
    description: '',
  });
  const [forumForm, setForumForm] = useState<ForumFormState>({
    id: null,
    category_id: '',
    name: '',
    slug: '',
    description: '',
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingForum, setSavingForum] = useState(false);

  const totalForumCount = useMemo(
    () =>
      categories.reduce((sum, category) => {
        return sum + (category.forum_forums?.length || 0);
      }, 0),
    [categories]
  );

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_categories')
      .select(
        `id, name, slug, description, created_at, forum_forums (id, name, slug, description, category_id, created_at, forum_threads (count))`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Forum kategorileri alınamadı', error);
      showError('Forum kategorileri yüklenemedi: ' + error.message);
      setCategories([]);
    } else if (data) {
      setCategories(data as ForumCategoryWithForums[]);
      if (!forumForm.category_id && data.length > 0) {
        setForumForm((prev) => ({ ...prev, category_id: data[0].id }));
      }
    }

    setLoading(false);
  }, [showError, forumForm.category_id]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadCategories();
    }
  }, [user, authLoading, loadCategories]);

  const resetCategoryForm = () =>
    setCategoryForm({ id: null, name: '', slug: '', description: '' });

  const resetForumForm = () =>
    setForumForm({ id: null, category_id: categories[0]?.id || '', name: '', slug: '', description: '' });

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingCategory(true);

    const slug = categoryForm.slug || slugify(categoryForm.name);
    const payload = {
      name: categoryForm.name,
      slug,
      description: categoryForm.description || null,
    };

    const { error } = categoryForm.id
      ? await supabase.from('forum_categories').update(payload).eq('id', categoryForm.id)
      : await supabase.from('forum_categories').insert(payload);

    if (error) {
      console.error('Kategori kaydedilemedi', error);
      showError('Kategori kaydedilemedi: ' + error.message);
    } else {
      success(categoryForm.id ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
      resetCategoryForm();
      loadCategories();
    }

    setSavingCategory(false);
  }

  async function handleForumSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingForum(true);

    const slug = forumForm.slug || slugify(forumForm.name);
    const payload = {
      category_id: forumForm.category_id,
      name: forumForm.name,
      slug,
      description: forumForm.description || null,
    };

    const { error } = forumForm.id
      ? await supabase.from('forum_forums').update(payload).eq('id', forumForm.id)
      : await supabase.from('forum_forums').insert(payload);

    if (error) {
      console.error('Alt forum kaydedilemedi', error);
      showError('Alt forum kaydedilemedi: ' + error.message);
    } else {
      success(forumForm.id ? 'Alt forum güncellendi' : 'Alt forum oluşturuldu');
      resetForumForm();
      loadCategories();
    }

    setSavingForum(false);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('forum_categories').delete().eq('id', id);

    if (error) {
      console.error('Kategori silinemedi', error);
      showError('Kategori silinemedi: ' + error.message);
      return;
    }

    success('Kategori silindi');
    resetCategoryForm();
    loadCategories();
  }

  async function handleDeleteForum(id: string) {
    if (!confirm('Bu alt forumu silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('forum_forums').delete().eq('id', id);

    if (error) {
      console.error('Alt forum silinemedi', error);
      showError('Alt forum silinemedi: ' + error.message);
      return;
    }

    success('Alt forum silindi');
    resetForumForm();
    loadCategories();
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Forum Yönetimi"
      description="Kategorileri ve alt forumları oluşturun, güncelleyin veya silin"
      backHref="/admin"
      actions={[{ label: 'Foruma Git', href: '/forum' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-400" /> Forum Kategorileri
              </h2>
              <p className="text-sm text-zinc-400">Toplam {categories.length} kategori, {totalForumCount} alt forum</p>
            </div>
            <button
              onClick={resetCategoryForm}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:border-green-500/60"
            >
              <Plus className="w-4 h-4" /> Yeni Kategori
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center text-zinc-300">
              Henüz kategori yok. Sağdaki formdan ekleyin.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const threadCount = category.forum_forums.reduce((sum, forum) => {
                  const countValue = forum.forum_threads?.[0]?.count ?? 0;
                  return sum + (countValue || 0);
                }, 0);

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 shadow-lg shadow-emerald-900/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-xs text-zinc-400">/{category.slug}</p>
                        {category.description && <p className="text-sm text-zinc-300 mt-1">{category.description}</p>}
                        <p className="text-xs text-zinc-500 mt-2">
                          {category.forum_forums.length} alt forum · {threadCount} konu
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setCategoryForm({
                              id: category.id,
                              name: category.name,
                              slug: category.slug,
                              description: category.description || '',
                            })
                          }
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 hover:border-green-500/60"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {category.forum_forums.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.forum_forums.map((forum) => (
                          <div
                            key={forum.id}
                            className="rounded-lg border border-white/5 bg-white/5 p-3 flex items-start justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <MessageSquare className="w-4 h-4 text-green-400" /> {forum.name}
                              </div>
                              <p className="text-xs text-zinc-400">/{forum.slug}</p>
                              {forum.description && <p className="text-sm text-zinc-300">{forum.description}</p>}
                              <p className="text-xs text-zinc-500">
                                {(forum.forum_threads?.[0]?.count ?? 0) || 0} konu
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setForumForm({
                                    id: forum.id,
                                    category_id: forum.category_id,
                                    name: forum.name,
                                    slug: forum.slug,
                                    description: forum.description || '',
                                  })
                                }
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 hover:border-green-500/60"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteForum(forum.id)}
                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={handleCategorySubmit} className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Kategori Oluştur / Güncelle</h3>
              {categoryForm.id && <span className="text-xs text-zinc-400">Düzenleniyor</span>}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Kategori Adı</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Otomatik için boş bırakın"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Açıklama</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                  rows={3}
                  placeholder="İsteğe bağlı"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-green-400 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {categoryForm.id ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white hover:border-green-500/60"
                >
                  Temizle
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handleForumSubmit} className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Alt Forum Oluştur / Güncelle</h3>
              {forumForm.id && <span className="text-xs text-zinc-400">Düzenleniyor</span>}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Kategori</label>
                <select
                  value={forumForm.category_id}
                  onChange={(e) => setForumForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                  required
                >
                  <option value="" disabled>
                    Kategori seçin
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Alt Forum Adı</label>
                <input
                  type="text"
                  value={forumForm.name}
                  onChange={(e) => setForumForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Slug</label>
                <input
                  type="text"
                  value={forumForm.slug}
                  onChange={(e) => setForumForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Otomatik için boş bırakın"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1">Açıklama</label>
                <textarea
                  value={forumForm.description}
                  onChange={(e) => setForumForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-green-500"
                  rows={3}
                  placeholder="İsteğe bağlı"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingForum}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-green-400 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {forumForm.id ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={resetForumForm}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white hover:border-green-500/60"
                >
                  Temizle
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
