import React, { useState } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import PlacesMap from './PlacesMap';
import PlaceDetailsModal from './PlaceDetailsModal';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Search as SearchIcon, Loader2, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoginButton from './LoginButton';

const CATEGORIES = ['All', 'Beach', 'Mountain', 'City', 'Historic', 'Nature', 'Adventure'];
const BUDGETS = ['All', 'Low', 'Medium', 'High', 'Luxury'];

export default function Search() {
  const [user] = useAuthState(auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [budget, setBudget] = useState('All');
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (query.trim()) queryParams.append('query', query);
      if (category !== 'All') queryParams.append('category', category);
      if (budget !== 'All') queryParams.append('budget', budget);

      const response = await fetch(`/api/search/${user.uid}?${queryParams.toString()}`);
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-trek-green/20">
          <SearchIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-display font-black mb-4 dark:text-white">Search Places</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          Sign in to search for destinations and get personalized results.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
        <h2 className="text-5xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
          Where to <span className="text-gradient">next?</span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Search for destinations, activities, or vibes. Our AI understands what you're looking for.
        </p>
        
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-focus-within:text-trek-green transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'quiet beaches in France' or 'adventure sports in Japan'"
            className="w-full h-20 pl-16 pr-32 glass rounded-[2.5rem] text-xl focus:outline-none focus:ring-4 focus:ring-trek-green/20 transition-all shadow-xl shadow-zinc-100 dark:shadow-none dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-4 top-4 bottom-4 px-8 bg-gradient-primary text-white rounded-[1.5rem] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-trek-green/25"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${showFilters ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'glass text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {(category !== 'All' || budget !== 'All') && <span className="w-2 h-2 rounded-full bg-trek-green" />}
          </button>
          
          <div className="glass flex items-center p-1 rounded-full">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'map' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 rounded-[2rem] mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); handleSearch(); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c ? 'bg-trek-green text-white shadow-md shadow-trek-green/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Budget</h4>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        onClick={() => { setBudget(b); handleSearch(); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${budget === b ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {results.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <h3 className="text-2xl font-display font-bold dark:text-white">
              {query ? `Results for "${query}"` : 'Recommended Places'}
            </h3>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">{results.length} places found</span>
          </div>
          
          {viewMode === 'list' ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {results.map((place, idx) => (
                <motion.div
                  key={place.place_id || place._id || idx}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } }
                  }}
                >
                  <div onClick={() => setSelectedPlace(place)} className="cursor-pointer h-full">
                    <PlaceCard place={place} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="h-[60vh] w-full">
              <PlacesMap places={results} />
            </div>
          )}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg italic">No results found for "{query}". Try adjusting your filters!</p>
        </div>
      )}

      <PlaceDetailsModal 
        place={selectedPlace} 
        isOpen={!!selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />
    </div>
  );
}
