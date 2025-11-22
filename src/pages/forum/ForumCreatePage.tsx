import { useEffect, useMemo, useState } from 'react';
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  ListOrdered,
  Paperclip,
  Send,
  Underline,
  Video,
} from 'lucide-react';
import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import {
  buildThreadPath,
  createForumThread,
  getForumCategoriesWithForums,
  type ForumCategory,
  type ForumForum,
} from '../../lib/forum';
import { navigate } from '../../lib/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export function ForumCreatePage() {
  const [categories, setCategories] = useState<(ForumCategory & { forums: ForumForum[] })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedForum, setSelectedForum] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const notification = useNotification();

  useEffect(() => {
    document.title = 'Yeni Forum Konusu Oluştur';
    document.body.dataset.forumTheme = 'light';

    getForumCategoriesWithForums().then(({ data }) => {
      if (!data) return;
      setCategories(data);
      if (data.length) {
        setSelectedCategory(data[0].id);
        if (data[0].forums?.length) {
          setSelectedForum(data[0].forums[0].id);
        }
      }
    });
  }, []);

  const availableForums = useMemo(() => {
    return categories.find((cat) => cat.id === selectedCategory)?.forums ?? [];
  }, [categories, selectedCategory]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim() || !selectedCategory || !selectedForum) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: createError } = await createForumThread({
      title: title.trim(),
      body: body.trim(),
      category_id: selectedCategory,
      forum_id: selectedForum,
      author_id: user?.id,
    });

    if (createError || !data) {
      setError('Konu oluşturulamadı. Lütfen tekrar deneyin.');
      setSubmitting(false);
      return;
    }

    notification.success('Konu yayınlandı.');
    navigate(buildThreadPath(data));
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ForumBreadcrumbs
              items={[
                { label: 'Forum', href: '/forum' },
                { label: 'Yeni Konu Oluştur' },
              ]}
              onNavigate={navigate}
            />
            <ForumThemeToggle />
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr] items-start">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Konu oluştur</h1>
                  <p className="text-sm text-slate-500">Başlığı, forumu ve mesaj detayını doldur.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/forum')}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    İptal et
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" /> Yayınla
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Konu başlığı</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Konu başlığını buraya yazın"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none"
                    maxLength={120}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Başlık 120 karakteri geçmemeli.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Kategori</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        const firstForum = categories.find((cat) => cat.id === e.target.value)?.forums?.[0]?.id;
                        setSelectedForum(firstForum || '');
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Alt forum</label>
                    <select
                      value={selectedForum}
                      onChange={(e) => setSelectedForum(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none"
                      disabled={!availableForums.length}
                    >
                      {!availableForums.length && <option>Önce kategori seçin</option>}
                      {availableForums.map((forum) => (
                        <option key={forum.id} value={forum.id}>
                          {forum.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metin araçları</span>
                  {[Bold, Italic, Underline].map((Icon, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  <button type="button" className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600">
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600">
                    <Video className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-md p-2 text-slate-600 transition hover:bg-white hover:text-emerald-600">
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="h-72 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none"
                  placeholder="Merhaba! Forum kurallarını okuyup sorunu detaylarıyla paylaşabilirsin."
                  required
                />

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    <Paperclip className="h-4 w-4" />
                    Dosya ekle
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    <ImageIcon className="h-4 w-4" />
                    Fotoğraf ekle
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    <Video className="h-4 w-4" />
                    Video ekle
                  </span>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
                <h3 className="text-lg font-bold">Kuralları hatırla</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  Açık ve anlaşılır başlıklar kullan, detayları paylaş, uygunsuz içerikten kaçın. Doğru kategori ve alt forumu
                  seçmek moderatörlerin işini kolaylaştırır.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-base font-semibold text-slate-900">Hızlı ipuçları</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Mesajını paragraf paragraf yaz ve önemli kısımları kalınlaştır.</li>
                  <li>• Fotoğraf ve video ekleyerek problemi daha iyi anlat.</li>
                  <li>• Gönderildikten sonra konuya yanıt gelince bildirim alırsın.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
