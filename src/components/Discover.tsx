import React, { useEffect, useState, useCallback } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import PlacesMap from './PlacesMap';
import PlaceDetailsModal from './PlaceDetailsModal';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';
import { Loader2, Sparkles, Map as MapIcon, List, Compass, RefreshCw } from 'lucide-react';
import LoginButton from './LoginButton';

export default function Discover() {
  const [user] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userInteractions, setUserInteractions] = useState<{liked: Set<string>, saved: Set<string>}>({
    liked: new Set(),
    saved: new Set()
  });

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      // First fetch interactions
      const interactionsRes = await fetch(`/api/interactions/${user.uid}`);
      const interactionsResult = await interactionsRes.json();
      const liked = new Set<string>();
      const saved = new Set<string>();
      if (interactionsResult.data) {
        interactionsResult.data.forEach((data: any) => {
          if (data.interaction_type === 'like') liked.add(data.place_id);
          if (data.interaction_type === 'save') saved.add(data.place_id);
        });
      }
      setUserInteractions({ liked, saved });

      // Then fetch recommendations
      const recommendationsRes = await fetch(`/api/recommendations/${user.uid}`);
      const recommendationsResult = await recommendationsRes.json();
      if (recommendationsResult.data) {
        setPlaces(recommendationsResult.data.map((item: any) => item.place));
      }
    } catch (error) {
      console.error('Failed to fetch user data for Discover:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-trek-green animate-spin" />
        <p className="text-[#767676] dark:text-zinc-400 font-medium">Curating your personalized travel guide...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-trek-green/20">
          <Compass className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-display font-black mb-4 dark:text-white">
          Sign in to <span className="text-trek-green">Discover</span>
        </h2>
        <p className="text-[#767676] dark:text-zinc-400 text-lg leading-relaxed mb-8">
          Log in to unlock personalized travel recommendations based on your preferences and travel style.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
              Discover <span className="text-gradient">Places</span>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 ml-2 rounded-full bg-zinc-100 dark:bg-[#E9E9E9] dark:bg-[#333333] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </h2>
            <p className="text-[#767676] dark:text-zinc-400">Handpicked destinations based on your unique travel profile.</p>
          </div>
        </div>
        
        <div className="bg-[#F0F0F0] border border-[#E9E9E9] dark:border-[#333333] flex items-center p-1 rounded-full self-start md:self-auto shadow-lg shadow-black/20">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0] shadow-sm' : 'text-zinc-400 hover:text-[#E2E8F0]'}`}
          >
            <List className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'map' ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0] shadow-sm' : 'text-zinc-400 hover:text-[#E2E8F0]'}`}
          >
            <MapIcon className="w-4 h-4" />
            Intel Map
          </button>
        </div>
      </div>

      {refreshing && viewMode === 'list' && (
         <div className="flex justify-center items-center py-10 w-full">
            <Loader2 className="w-10 h-10 text-trek-green animate-spin" />
         </div>
      )}

      {viewMode === 'list' ? (!refreshing &&
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
          {places.map((place, idx) => (
            <motion.div
              key={place.place_id || place._id || idx}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } }
              }}
            >
              <div onClick={() => setSelectedPlace(place)} className="cursor-pointer h-full">
                <PlaceCard
                  place={place}
                  isLiked={userInteractions.liked.has(place.place_id || place._id || '')}
                  isSaved={userInteractions.saved.has(place.place_id || place._id || '')}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="h-[70vh] w-full relative">
          {refreshing && (
             <div className="absolute inset-0 bg-white dark:bg-[#111111]/50 dark:bg-[#111111]/50 backdrop-blur-sm z-10 flex justify-center items-center rounded-3xl">
                <Loader2 className="w-10 h-10 text-trek-green animate-spin" />
             </div>
          )}
          <PlacesMap places={places} />
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
