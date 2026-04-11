import React, { useState } from 'react';
import { Place } from '../types';
import { Heart, Bookmark, MapPin, Star, Accessibility } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';

interface PlaceCardProps {
  place: Place;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function PlaceCard({ place, isLiked: initialLiked = false, isSaved: initialSaved = false }: PlaceCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);

  const toggleInteraction = async (type: 'like' | 'save') => {
    if (!auth.currentUser) return;

    const isCurrentlyActive = type === 'like' ? isLiked : isSaved;
    const action = isCurrentlyActive ? `un${type}` : type;

    try {
      if (type === 'like') setIsLiked(!isLiked);
      if (type === 'save') setIsSaved(!isSaved);

      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: auth.currentUser.uid,
          place_id: place.place_id,
          interaction_type: action
        })
      });
    } catch (error) {
      console.error('Failed to toggle interaction:', error);
      // Revert on error
      if (type === 'like') setIsLiked(isCurrentlyActive);
      if (type === 'save') setIsSaved(isCurrentlyActive);
    }
  };

  // Helper to get a color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Beach': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'Mountain': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      'City': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      'Historic': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      'Nature': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      'Adventure': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    };
    return colors[category] || 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2rem] overflow-hidden card-hover group h-full flex flex-col relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-teal-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.image || `https://source.unsplash.com/800x600/?${encodeURIComponent(place.category || 'travel')}`}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleInteraction('like')}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
              isLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/20 text-white hover:bg-white/40'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleInteraction('save')}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
              isSaved ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white/20 text-white hover:bg-white/40'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border ${getCategoryColor(place.category || '')}`}>
            {place.category || 'Destination'}
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm text-white">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold">{place.average_rating || '4.5'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
            {place.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-sm mb-4 font-medium">
          <MapPin className="w-4 h-4 text-cyan-500" />
          <span>{place.location.city}, {place.location.country}</span>
        </div>

        <p className="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
          {place.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
          {place.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-lg">
              #{tag}
            </span>
          ))}
          {place.accessibility?.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
              <Accessibility className="w-3 h-3" />
              <span>Accessible</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
