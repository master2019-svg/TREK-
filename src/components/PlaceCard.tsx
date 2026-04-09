import React, { useState } from 'react';
import { Place } from '../types';
import { Heart, Bookmark, MapPin, Star, Accessibility } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

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

    const interactionId = `${auth.currentUser.uid}_${place.place_id}_${type}`;
    const interactionRef = doc(db, 'interactions', interactionId);

    try {
      if ((type === 'like' && isLiked) || (type === 'save' && isSaved)) {
        await deleteDoc(interactionRef);
        if (type === 'like') setIsLiked(false);
        if (type === 'save') setIsSaved(false);
      } else {
        await setDoc(interactionRef, {
          user_id: auth.currentUser.uid,
          place_id: place.place_id,
          interaction_type: type,
          timestamp: serverTimestamp(),
        });
        if (type === 'like') setIsLiked(true);
        if (type === 'save') setIsSaved(true);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `interactions/${interactionId}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[2rem] overflow-hidden card-hover group h-full flex flex-col"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.image || `https://picsum.photos/seed/${place.place_id}/800/600`}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => toggleInteraction('like')}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
              isLiked ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-white/80 text-zinc-900 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => toggleInteraction('save')}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
              isSaved ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-400' : 'bg-white/80 text-zinc-900 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm font-bold">{place.average_rating || '4.5'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-display font-bold text-zinc-900 leading-tight">{place.name}</h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{place.location.city}, {place.location.country}</span>
        </div>

        <p className="text-zinc-600 text-sm line-clamp-2 mb-6 leading-relaxed">
          {place.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          {place.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              #{tag}
            </span>
          ))}
          {place.accessibility.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg">
              <Accessibility className="w-3 h-3" />
              <span>Accessible</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
