import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import PlacesMap from './PlacesMap';
import PlaceDetailsModal from './PlaceDetailsModal';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Map as MapIcon, List, Compass, RefreshCw, ChevronDown } from 'lucide-react';
import LoginButton from './LoginButton';

interface DiscoverProps {
  setActiveTab?: (tab: string) => void;
}

export default function Discover({ setActiveTab }: DiscoverProps) {
  const [user] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userInteractions, setUserInteractions] = useState<{liked: Set<string>, saved: Set<string>}>({
    liked: new Set(),
    saved: new Set()
  });

  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const observerTarget = useRef(null);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (isLoadMore) setLoadingMore(true);
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
        const newPlaces = recommendationsResult.data.map((item: any) => item.place);
        if (isLoadMore) {
          setPlaces(prev => {
            const currentIds = new Set(prev.map(p => p.place_id || p._id));
            const uniqueNew = newPlaces.filter((p: any) => !currentIds.has(p.place_id || p._id));
            if (uniqueNew.length < 5) setHasMore(false);
            return [...prev, ...uniqueNew];
          });
        } else {
          setPlaces(newPlaces);
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data for Discover:', error);
    } finally {
      if (!isLoadMore) setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      setPullY(0);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && !refreshing && places.length > 0 && hasMore) {
          fetchData(true);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, loading, loadingMore, refreshing, places, fetchData]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && window.scrollY === 0) {
      const y = e.touches[0].clientY - touchStartY.current;
      if (y > 0 && y < 150) setPullY(y);
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 80) {
      setRefreshing(true);
      fetchData();
    } else {
      setPullY(0);
    }
    touchStartY.current = 0;
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
    <div 
      className="space-y-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-[-80px] left-0 right-0 flex justify-center items-center h-20 transition-transform duration-200"
        style={{ transform: `translateY(${refreshing ? 80 : Math.min(pullY, 80)}px)` }}
      >
        <div className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] shadow-lg rounded-full p-3 flex items-center justify-center">
          <RefreshCw className={`w-5 h-5 text-[#E60023] ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullY * 2}deg)` }} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
              Discover <span className="text-gradient">Places</span>
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
            Explore Map
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
          {loadingMore && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-6">
              <Loader2 className="w-8 h-8 text-[#E60023] animate-spin" />
            </div>
          )}
          <div ref={observerTarget} className="h-10 w-full col-span-1 md:col-span-2 lg:col-span-3" />
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
