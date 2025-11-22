import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRightCircle, MessageSquarePlus } from 'lucide-react';
import {
  createForumThread,
  getForumCategoriesWithForums,
  type ForumCategory,
  type ForumForum,
} from '../../lib/forum';
import { navigate } from '../../lib/navigation';
import { useNotification } from '../../contexts/NotificationContext';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';

export function ForumCreatePage() {
  const [categories, setCategories] = useState<(ForumCategory & { forums: ForumForum[] })[]>([]);
  const [categorySlug, setCategorySlug] = useState('genel');
  const [forumSlug, setForumSlug] = useState('site-duyurulari');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    document.title = 'Yeni Forum | Bobin Kardeşler';
    getForumCategoriesWithForums().then(({ data }) => {
      setCategories(data);
      if (data.length && data[0].forums.length) {
        setCategorySlug(data[0].slug);
        setForumSlug(data[0].forums[0].slug);
      }
    });
  }, []);

  const forumsForCategory = useMemo(
    () => categories.find((item) => item.slug === categorySlug)?.forums ?? [],
    [categories, categorySlug]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      notification.error('Başlık ve içerik zorunludur.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createForumThread({ title, body, categorySlug, forumSlug });
    setSubmitting(false);

    if (error || !data) {
      notification.error('Konu oluşturulamadı.');
      return;
    }

    notification.success('Konu oluşturuldu.');
    navigate(`/forum/konu/${data.slug}-${data.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-24 sm:pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <button
              onClick={() => navigate('/forum')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Foruma dön
            </button>
            <ForumThemeToggle />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 text-blue-700 p-3">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Yeni konu aç</h1>
                <p className="text-sm text-slate-600">
                  Google doğrulaması gereken hızlı forum formu. Kategori, alt forum ve açıklamalar SEO uyumlu URL yapısıyla otomatik oluşur.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                  Kategori
                  <select
                    value={categorySlug}
                    onChange={(event) => setCategorySlug(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-800 shadow-sm focus:border-emerald-400 focus:outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                  Alt forum
                  <select
                    value={forumSlug}
                    onChange={(event) => setForumSlug(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-800 shadow-sm focus:border-emerald-400 focus:outline-none"
                  >
                    {forumsForCategory.map((forum) => (
                      <option key={forum.id} value={forum.slug}>
                        {forum.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Başlık
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-800 shadow-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="Kısa ve açıklayıcı başlık"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Mesaj
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="min-h-[160px] rounded-lg border border-slate-200 px-3 py-2 text-slate-800 shadow-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="Detaylı açıklama, cihaz bilgisi, ekran görüntüsü vb."
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>Google doğrulaması gerekli. Spam ve sahte hesaplar engellenir.</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-400 disabled:opacity-60"
                >
                  {submitting ? 'Yükleniyor...' : 'Konuyu oluştur'}
                  <ArrowRightCircle className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
