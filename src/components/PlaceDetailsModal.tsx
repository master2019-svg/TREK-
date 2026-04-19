import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Heart, Bookmark, Accessibility, ThumbsUp, MessageSquare, Share2, Check } from 'lucide-react';
import PlaceImage from './PlaceImage';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && place) {
      setLoadingReviews(true);
      fetch(`/api/reviews/${place.place_id}`)
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

  const handleShare = async () => {
    if (!place) return;
    
    const shareData = {
      title: `Check out ${place.name} on Trek`,
      text: `I found ${place.name} in ${place.location.city}, ${place.location.country} on Trek! It looks amazing.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl z-[101] custom-scrollbar"
          >
            <div className="relative h-72">
              <PlaceImage
                place={place}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent opacity-90" />
              
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                MUST VISIT
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl font-display font-black text-white mb-2 leading-tight">{place.name}</h2>
                <div className="flex items-end justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-medium">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{place.location.city}, {place.location.country}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {place.location && (() => {
                      const lat = Number(place.location.coordinates?.lat || place.location.latitude);
                      const lng = Number(place.location.coordinates?.lng || place.location.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-trek-green hover:bg-trek-dark text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Get Directions
                          </a>
                        );
                      }
                      return null;
                    })()}
                    <button
                      onClick={handleShare}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Share Place
                        </>
                      )}
                    </button>
                  </div>
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
