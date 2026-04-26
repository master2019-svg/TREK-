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
        <p className="text-[#767676] dark:text-zinc-400 text-lg leading-relaxed mb-8">
          Sign in to search for destinations and get personalized results.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
        <h2 className="text-5xl font-display font-black text-[#E60023] tracking-tight">
          Where to <span className="text-[#E60023]">next?</span>
        </h2>
        <p className="text-slate-600 font-medium text-lg">
          Search for destinations, activities, or vibes. Our AI understands what you're looking for.
        </p>
        
        <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto mt-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E60023]/10 blur-md rounded-full scale-y-75 transition-all pointer-events-none" />
            <div className="relative flex items-center bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] border-4 rounded-full p-1 pl-4 pr-1 focus-within:border-[#E60023] shadow-lg transition-all overflow-hidden bg-clip-padding">
              
              <SearchIcon className="w-6 h-6 text-[#E60023] mr-2 shrink-0" />
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full h-14 bg-[#f0f0f0] dark:bg-[#1f1f1f] text-[#111111] dark:text-[#F0F0F0] placeholder-slate-500 text-lg font-bold focus:outline-none tracking-wide z-10"
              />
              
              <button
                type="submit"
                disabled={loading}
                className="ml-2 px-8 py-4 bg-[#E60023] text-white rounded-full font-bold text-lg hover:bg-[#E60023] transition-all focus:ring-4 focus:ring-[#E60023]/30 disabled:opacity-50 flex items-center gap-2 z-10"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${showFilters ? 'bg-[#111111] text-white dark:bg-white dark:bg-[#111111] dark:text-zinc-900' : 'bg-white dark:bg-[#111111] text-[#767676] dark:text-[#A0A0A0] border border-[#E9E9E9] dark:border-[#333333] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#E9E9E9] dark:bg-[#333333]'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {(category !== 'All' || budget !== 'All') && <span className="w-2 h-2 rounded-full bg-trek-green" />}
          </button>
          
          <div className="bg-[#F0F0F0] border border-[#E9E9E9] dark:border-[#333333] flex items-center p-1 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0] shadow-sm' : 'text-[#767676] dark:text-[#A0A0A0] hover:text-[#111111] dark:text-[#F0F0F0]'}`}
            >
              <List className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'map' ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0] shadow-sm' : 'text-[#767676] dark:text-[#A0A0A0] hover:text-[#111111] dark:text-[#F0F0F0]'}`}
            >
              <MapIcon className="w-4 h-4" />
              Map View
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
              <div className="bg-[#161B22]/50 backdrop-blur-xl border border-[#FFFFFF15] p-6 rounded-[2rem] mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                  <h4 className="text-sm font-bold text-[#E2E8F0] uppercase tracking-wider mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); handleSearch(); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0] shadow-sm' : 'bg-[#F0F0F0] border border-[#FFFFFF15] text-[#E2E8F0] hover:border-[#D4AF37]/50'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#E2E8F0] uppercase tracking-wider mb-3">Budget</h4>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        onClick={() => { setBudget(b); handleSearch(); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${budget === b ? 'bg-[#FF4B4B] text-white shadow-[0_0_15px_rgba(255,75,75,0.3)]' : 'bg-[#F0F0F0] border border-[#FFFFFF15] text-[#E2E8F0] hover:border-[#FF4B4B]/50'}`}
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
          <div className="flex items-center justify-between border-b border-[#FFFFFF15] pb-6">
            <h3 className="text-2xl font-display font-bold text-[#E60023]">
              {query ? `Results for "${query}"` : 'Recommended Targets'}
            </h3>
            <span className="text-[#767676] dark:text-[#A0A0A0] font-medium tracking-widest uppercase text-xs">{results.length} identified</span>
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
