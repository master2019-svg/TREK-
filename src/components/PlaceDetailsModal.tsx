import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Heart, Bookmark, Accessibility, ThumbsUp, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
}

interface PlaceDetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaceDetailsModal({ place, isOpen, onClose }: PlaceDetailsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && place) {
      setLoadingReviews(true);
      fetch(`/api/reviews/${place.place_id || place._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.length > 0) {
            setReviews(data.data);
          } else {
            // Fallback to mock reviews if none exist
            setReviews([
              {
                id: 'mock1',
                reviewer_name: 'user001',
                rating: 5,
                comment: 'Amazing place to visit! Highly recommended.'
              },
              {
                id: 'mock2',
                reviewer_name: 'traveler99',
                rating: 4,
                comment: 'A must-see destination. The views are incredible.'
              }
            ]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch reviews", err);
          // Fallback to mock reviews on error
          setReviews([
            {
              id: 'mock1',
              reviewer_name: 'user001',
              rating: 5,
              comment: 'Amazing place to visit! Highly recommended.'
            },
            {
              id: 'mock2',
              reviewer_name: 'traveler99',
              rating: 4,
              comment: 'A must-see destination. The views are incredible.'
            }
          ]);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    } else {
      setReviews([]);
    }
  }, [isOpen, place]);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 font-medium">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{place.location.city}, {place.location.country}</span>
                  </div>
                  
                  {place.location.coordinates && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.coordinates.lat},${place.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-trek-green hover:bg-trek-dark text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Get Directions
                    </a>
                  )}
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
                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-trek-green" />
                  Reviews
                </h3>
                <div className="space-y-4">
                  {loadingReviews ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"></div>
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"></div>
                    </div>
                  ) : (
                    reviews.map((review, index) => (
                      <div 
                        key={review.id} 
                        className={`p-4 rounded-2xl ${
                          index % 2 === 0 
                            ? 'bg-trek-green text-white rounded-tl-none' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tr-none ml-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold">{review.reviewer_name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1">
                            <Star className={`w-4 h-4 fill-current ${index % 2 === 0 ? 'text-yellow-300' : 'text-yellow-500'}`} />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className={index % 2 === 0 ? 'text-teal-50' : 'text-zinc-600 dark:text-zinc-300'}>
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
