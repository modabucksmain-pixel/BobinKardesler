import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = 'Ara...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className={`relative flex items-center bg-zinc-900 border rounded-lg transition-all duration-300 ${
          isFocused ? 'border-green-500 ring-2 ring-green-500/20' : 'border-zinc-800'
        }`}
      >
        <Search className="w-5 h-5 text-zinc-500 ml-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-4 p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>
    </form>
  );
}
