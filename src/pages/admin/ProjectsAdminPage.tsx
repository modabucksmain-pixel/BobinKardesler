import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Wrench, Plus, Edit, Trash2, Eye, Heart, ArrowLeft, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  youtube_video_id: string | null;
  github_url: string | null;
  thumbnail_url: string;
  components: string | null;
  featured: boolean;
  views: number;
  likes: number;
  created_at: string;
}

export function ProjectsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadProjects();
    }
  }, [user, authLoading]);

  async function loadProjects() {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (!error) {
      loadProjects();
    }
  }

  async function toggleFeatured(id: string, currentStatus: boolean) {
    await supabase
      .from('projects')
      .update({ featured: !currentStatus })
      .eq('id', id);

    loadProjects();
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
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Proje Yönetimi</h1>
              <p className="text-zinc-400">Projeleri yönetin</p>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Proje</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Wrench className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz proje yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300"
              >
                <div className="relative aspect-video">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  {project.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-zinc-950">
                      ⭐ Öne Çıkan
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">{project.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-zinc-400 mb-3">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{project.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{project.likes}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeatured(project.id, project.featured)}
                      className={`p-2 rounded-lg transition-colors ${
                        project.featured
                          ? 'text-yellow-500 hover:text-yellow-400'
                          : 'text-zinc-400 hover:text-yellow-500'
                      }`}
                      title={project.featured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowModal(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingProject(null);
            loadProjects();
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
  onSaved,
  userId,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(project?.difficulty || 'beginner');
  const [category, setCategory] = useState(project?.category || '');
  const [youtubeVideoId, setYoutubeVideoId] = useState(project?.youtube_video_id || '');
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnail_url || '');
  const [components, setComponents] = useState(project?.components || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (project) {
      await supabase
        .from('projects')
        .update({
          title,
          description,
          difficulty,
          category,
          youtube_video_id: youtubeVideoId || null,
          github_url: githubUrl || null,
          thumbnail_url: thumbnailUrl,
          components: components || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);
    } else {
      await supabase.from('projects').insert({
        title,
        description,
        difficulty,
        category,
        youtube_video_id: youtubeVideoId || null,
        github_url: githubUrl || null,
        thumbnail_url: thumbnailUrl,
        components: components || null,
        created_by: userId,
      });
    }

    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-6">
          {project ? 'Projeyi Düzenle' : 'Yeni Proje'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
                placeholder="Örn: Arduino, ESP32, vb."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Zorluk Seviyesi</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              >
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Thumbnail URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">YouTube Video ID (İsteğe bağlı)</label>
              <input
                type="text"
                value={youtubeVideoId}
                onChange={(e) => setYoutubeVideoId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
                placeholder="dQw4w9WgXcQ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">GitHub URL (İsteğe bağlı)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Bileşenler (İsteğe bağlı)</label>
              <textarea
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 resize-none"
                placeholder="Arduino Uno, LED, Direnç, vb."
              />
            </div>
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
