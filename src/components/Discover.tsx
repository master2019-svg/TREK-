import React, { useEffect, useState } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import PlacesMap from './PlacesMap';
import PlaceDetailsModal from './PlaceDetailsModal';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';
import { Loader2, Sparkles, Map as MapIcon, List } from 'lucide-react';

export default function Discover() {
  const [user] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userInteractions, setUserInteractions] = useState<{liked: Set<string>, saved: Set<string>}>({
    liked: new Set(),
    saved: new Set()
  });

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/interactions/${user.uid}`);
        const result = await response.json();
        const liked = new Set<string>();
        const saved = new Set<string>();
        if (result.data) {
          result.data.forEach((data: any) => {
            if (data.interaction_type === 'like') liked.add(data.place_id);
            if (data.interaction_type === 'save') saved.add(data.place_id);
          });
        }
        setUserInteractions({ liked, saved });
      } catch (error) {
        console.error('Failed to fetch interactions:', error);
      }
    };

    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/recommendations/${user.uid}`);
        const result = await response.json();
        if (result.data) {
          setPlaces(result.data.map((item: any) => item.place));
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Curating your personalized travel guide...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
          <Sparkles className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3 dark:text-white">Sign in to <span className="text-gradient">Discover</span></h2>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Log in to unlock personalized travel recommendations based on your preferences and travel style.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2">
            Discover <span className="text-gradient">Places</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Handpicked destinations based on your unique travel profile.</p>
        </div>
        
        <div className="glass flex items-center p-1 rounded-full self-start md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'map' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <MapIcon className="w-4 h-4" />
            Map
          </button>
        </div>
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
          {places.map((place) => (
            <motion.div
              key={place.place_id}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } }
              }}
            >
              <div onClick={() => setSelectedPlace(place)} className="cursor-pointer h-full">
                <PlaceCard
                  place={place}
                  isLiked={userInteractions.liked.has(place.place_id)}
                  isSaved={userInteractions.saved.has(place.place_id)}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="h-[70vh] w-full">
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
