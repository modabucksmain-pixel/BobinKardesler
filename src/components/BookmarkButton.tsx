import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { addBookmark, removeBookmark, isBookmarked } from '../lib/bookmarks';
import { useNotification } from '../contexts/NotificationContext';

interface BookmarkButtonProps {
  contentType: 'video' | 'blog_post';
  contentId: string;
  className?: string;
}

export function BookmarkButton({ contentType, contentId, className = '' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    checkBookmarkStatus();
  }, [contentType, contentId]);

  async function checkBookmarkStatus() {
    const status = await isBookmarked(contentType, contentId);
    setBookmarked(status);
  }

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    if (bookmarked) {
      const { error: removeError } = await removeBookmark(contentType, contentId);
      if (!removeError) {
        setBookmarked(false);
        success('Favorilerden kaldırıldı');
      } else {
        error('Bir hata oluştu');
      }
    } else {
      const { error: addError } = await addBookmark(contentType, contentId);
      if (!addError) {
        setBookmarked(true);
        success('Favorilere eklendi');
      } else {
        error('Bir hata oluştu');
      }
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-all duration-300 ${
        bookmarked
          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-green-500'
      } ${className}`}
      title={bookmarked ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      <Bookmark
        className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`}
      />
    </button>
  );
}
