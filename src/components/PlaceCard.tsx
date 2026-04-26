import React, { useState } from 'react';
import { Place } from '../types';
import { Heart, Bookmark, MapPin, Star, Accessibility } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import PlaceImage from './PlaceImage';

interface PlaceCardProps {
  place: Place;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default React.memo(function PlaceCard({ place, isLiked: initialLiked = false, isSaved: initialSaved = false }: PlaceCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);

  const toggleInteraction = async (type: 'like' | 'save') => {
    if (!auth.currentUser) return;

    const isCurrentlyActive = type === 'like' ? isLiked : isSaved;
    const action = isCurrentlyActive ? `un${type}` : type;

    try {
      if (type === 'like') setIsLiked(!isLiked);
      if (type === 'save') setIsSaved(!isSaved);

      const interactionId = `${auth.currentUser.uid}_${place.place_id}_${type}`;
      
      if (action.startsWith('un')) {
        await deleteDoc(doc(db, "interactions", interactionId));
      } else {
        await setDoc(doc(db, "interactions", interactionId), {
          user_id: auth.currentUser.uid,
          place_id: place.place_id,
          interaction_type: type,
          timestamp: new Date().toISOString()
        });
      }
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
      className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#003B95]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative h-56 overflow-hidden">
        <PlaceImage
          place={place}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); toggleInteraction('like'); }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${
              isLiked ? 'bg-[#E60023] text-white shadow-md' : 'bg-white dark:bg-[#111111]/80 text-[#111111] dark:text-[#F0F0F0] hover:bg-white dark:bg-[#111111]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); toggleInteraction('save'); }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${
              isSaved ? 'bg-[#E60023] text-white shadow-md' : 'bg-white dark:bg-[#111111]/80 text-[#111111] dark:text-[#F0F0F0] hover:bg-white dark:bg-[#111111]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="px-3 py-1 bg-white dark:bg-[#111111] text-[#E60023] rounded-full text-xs font-bold shadow-sm">
            {place.category || 'Destination'}
          </div>
          <div className="bg-[#E60023] px-2.5 py-1.5 rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(0,59,149,0.3)] min-w-[36px]">
            <span className="text-sm font-bold text-white leading-none">{place.average_rating || '8.5'}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-[#111111] dark:text-[#F0F0F0] leading-tight group-hover:text-[#111111] dark:text-[#F0F0F0] transition-colors">
            {place.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 text-[#111111] dark:text-[#F0F0F0] text-xs mb-3 font-bold underline text-[#111111] dark:text-[#F0F0F0] underline-offset-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>{place.location.city}, {place.location.country}</span>
        </div>

        <p className="text-[#767676] dark:text-[#A0A0A0] text-sm line-clamp-2 leading-relaxed flex-1">
          {place.description}
        </p>

        <div className="mt-4 pt-4 border-t border-[#E9E9E9] dark:border-[#333333] flex flex-wrap gap-2">
          {place.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#1f1f1f] text-[#767676] dark:text-[#A0A0A0] border border-[#E9E9E9] dark:border-[#333333] text-[10px] font-bold uppercase tracking-wide rounded-md">
              {tag}
            </span>
          ))}
          {place.accessibility?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#1f1f1f] text-[#767676] dark:text-[#A0A0A0] text-[10px] font-bold uppercase tracking-wide rounded-md">
              <Accessibility className="w-3 h-3 border-[#E9E9E9] dark:border-[#333333] border rounded-sm p-0.5" />
              <span>Accessible</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
