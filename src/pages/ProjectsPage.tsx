import { useEffect, useState } from 'react';
import { Wrench, Github, Play, Heart, Eye, Filter } from 'lucide-react';
import { getAllProjects, type Project, difficultyLabels, difficultyColors } from '../lib/projects';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, selectedCategory, selectedDifficulty]);

  async function loadProjects() {
    setLoading(true);
    const data = await getAllProjects();
    setProjects(data);
    setLoading(false);
  }

  function filterProjects() {
    let filtered = [...projects];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    setFilteredProjects(filtered);
  }

  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-block p-3 sm:p-4 bg-green-500/10 rounded-full mb-4 sm:mb-6">
            <Wrench className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 mb-3 sm:mb-4 glow-text px-2">
            Proje Galerisi
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Tamamlanmış projeler, detaylı açıklamalar ve kaynak kodları
          </p>
        </div>

        {!loading && projects.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
              >
                <option value="all">Tümü</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Zorluk Seviyesi
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
              >
                <option value="all">Tümü</option>
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900/50 rounded-lg h-96"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Wrench className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Proje bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {project.featured && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center">
          <span className="text-yellow-500 text-xs font-semibold">⭐ Öne Çıkan Proje</span>
        </div>
      )}

      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.thumbnail_url}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 bg-zinc-900/90 backdrop-blur-sm rounded-full text-xs font-semibold ${difficultyColors[project.difficulty]}`}>
            {difficultyLabels[project.difficulty]}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-zinc-100 group-hover:text-green-500 transition-colors line-clamp-1">
            {project.title}
          </h3>
        </div>

        <p className="text-sm text-zinc-400 mb-3 px-2 py-1 bg-zinc-800/50 rounded inline-block">
          {project.category}
        </p>

        <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
          {project.description}
        </p>

        <div className="flex items-center justify-between text-sm text-zinc-500 mb-4">
          <span className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{project.views}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{project.likes}</span>
          </span>
        </div>

        <div className="flex gap-2">
          {project.youtube_video_id && (
            <a
              href={`https://youtube.com/watch?v=${project.youtube_video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
            >
              <Play className="w-4 h-4" />
              <span>Video</span>
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold"
            >
              <Github className="w-4 h-4" />
              <span>Kod</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
