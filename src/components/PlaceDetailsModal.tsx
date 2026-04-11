import React from 'react';
import { Place } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Heart, Bookmark, Accessibility, ThumbsUp } from 'lucide-react';

interface PlaceDetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaceDetailsModal({ place, isOpen, onClose }: PlaceDetailsModalProps) {
  if (!place) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl z-[101] custom-scrollbar"
          >
            <div className="relative h-72">
              <img
                src={place.image || `https://source.unsplash.com/800x600/?${encodeURIComponent(place.category || 'travel')}`}
                alt={place.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
              
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                UNDER DEPLOYMENT COMING SOON
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl font-display font-black text-white mb-2 leading-tight">{place.name}</h2>
                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                  <MapPin className="w-5 h-5 text-teal-400" />
                  <span>{place.location.city}, {place.location.country}</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-xl font-bold dark:text-white">{place.average_rating || '4.5'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">15300</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-3">Description :</h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                  {place.description || "One of the world's most important artificial waterways, connecting the Mediterranean Sea to the Red Sea. A major route for global maritime trade, inaugurated in 1869."}
                </p>
              </div>

              {place.tags && place.tags.length > 0 && (
                <div>
                  <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-3">Tags :</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map(tag => (
                      <span key={tag} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-4">Reviews:</h3>
                <div className="space-y-4">
                  {/* Mock Review */}
                  <div className="bg-teal-600 text-white p-4 rounded-2xl rounded-tl-none">
                    <p className="font-bold mb-1">user001</p>
                    <p className="text-teal-50">Amazing place to visit! Highly recommended.</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl rounded-tr-none ml-8">
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">traveler99</p>
                    <p className="text-zinc-600 dark:text-zinc-300">A must-see destination. The views are incredible.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
