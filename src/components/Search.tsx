import React, { useState } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Search as SearchIcon, Loader2, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export default function Search() {
  const [user] = useAuthState(auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search/${user.uid}?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (result.data) {
        setResults(result.data.map((item: any) => item.place));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-5xl font-display font-bold text-zinc-900 tracking-tight">
          Where to next?
        </h2>
        <p className="text-zinc-500 text-lg">
          Search for destinations, activities, or vibes. Our AI understands what you're looking for.
        </p>
        
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'quiet beaches in France' or 'adventure sports in Japan'"
            className="w-full h-20 pl-16 pr-32 glass rounded-[2.5rem] text-xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all shadow-xl shadow-zinc-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-4 top-4 bottom-4 px-8 bg-zinc-900 text-white rounded-[1.5rem] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
            <h3 className="text-2xl font-display font-bold">Search Results</h3>
            <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((place, index) => (
              <motion.div
                key={place.place_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PlaceCard place={place} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg italic">No results found for "{query}". Try searching for something else!</p>
        </div>
      )}
    </div>
  );
}
