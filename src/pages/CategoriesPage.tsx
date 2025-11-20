import { useEffect, useState } from 'react';
import { Zap, Folder } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
            <Folder className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Video Kategorileri
          </h1>
          <p className="text-zinc-400 text-lg">
            İlgi alanınıza göre videoları keşfedin
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-xl h-48"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-lg border border-zinc-800">
            <Folder className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Henüz kategori yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <a
      href={`/videos?category=${category.slug}`}
      className="group block bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${category.color}20`, color: category.color }}
      >
        <Zap className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-zinc-400 line-clamp-2">{category.description}</p>
      )}
    </a>
  );
}
