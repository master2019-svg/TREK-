import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Heart, Bookmark, Accessibility, ThumbsUp, ThumbsDown, MessageSquare, Share2, Check, User as UserIcon, Send } from 'lucide-react';
import PlaceImage from './PlaceImage';
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Review {
  id: string;
  user_id?: string;
  reviewer_name: string;
  reviewer_photo?: string | null;
  rating: number;
  comment: string;
  likes?: string[];
  dislikes?: string[];
  replies?: Array<{
    id: string;
    reviewer_name: string;
    reviewer_photo?: string | null;
    comment: string;
    createdAt?: any;
  }>;
  createdAt?: any;
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
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [user] = useAuthState(auth);

  const fetchReviews = async () => {
    if (!place?.place_id) return;
    setLoadingReviews(true);
    try {
      const q = query(collection(db, "reviews"), where("place_id", "==", place.place_id));
      const snapshot = await getDocs(q);
      const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      
      if (fetchedReviews.length > 0) {
        setReviews(fetchedReviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkLikedStatus = async () => {
    if (!user || !place?.place_id) return;
    try {
      const interactionId = `${user.uid}_${place.place_id}_like`;
      const docSnap = await getDoc(doc(db, "interactions", interactionId));
      setIsLiked(docSnap.exists());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && place) {
      fetchReviews();
      if (user) {
        checkLikedStatus();
      }
    } else {
      setReviews([]);
      setIsLiked(false);
    }
  }, [isOpen, place, user]);

  const handleAddReview = async () => {
    if (!user || !place || !newReviewText.trim()) return;
    setIsSubmitting(true);
    try {
      let displayName = user.displayName || user.email?.split('@')[0] || 'Traveler';
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().nickname) {
           displayName = userDoc.data().nickname;
        }
      } catch (e) {}

      await addDoc(collection(db, "reviews"), {
        place_id: place.place_id,
        user_id: user.uid,
        reviewer_name: displayName,
        reviewer_photo: user.photoURL,
        rating: newReviewRating,
        comment: newReviewText.trim(),
        likes: [],
        dislikes: [],
        replies: [],
        createdAt: serverTimestamp()
      });
      setNewReviewText('');
      setNewReviewRating(5);
      fetchReviews();
    } catch (e) {
      console.error("Error adding review: ", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (review: Review, isDislike = false) => {
    if (!user) {
      alert("Authenticate to action this intel.");
      return;
    }
    
    // Using import { updateDoc } where it's already available at the top
    try {
      const reviewRef = doc(db, "reviews", review.id);
      const likes = review.likes || [];
      const dislikes = review.dislikes || [];
      
      let newLikes = [...likes];
      let newDislikes = [...dislikes];

      if (isDislike) {
        if (newDislikes.includes(user.uid)) {
          newDislikes = newDislikes.filter(id => id !== user.uid);
        } else {
          newDislikes.push(user.uid);
          newLikes = newLikes.filter(id => id !== user.uid);
        }
      } else {
        if (newLikes.includes(user.uid)) {
          newLikes = newLikes.filter(id => id !== user.uid);
        } else {
          newLikes.push(user.uid);
          newDislikes = newDislikes.filter(id => id !== user.uid);
        }
      }

      await updateDoc(reviewRef, { likes: newLikes, dislikes: newDislikes });
      fetchReviews();
    } catch (e) {
      console.error("Error updating rating:", e);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) return;
    try {
      let displayName = user.displayName || user.email?.split('@')[0] || 'Traveler';
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      if (reviewDoc.exists()) {
        const existingReplies = reviewDoc.data().replies || [];
        await updateDoc(reviewRef, {
          replies: [...existingReplies, {
            id: Date.now().toString(),
            reviewer_name: displayName,
            reviewer_photo: user.photoURL,
            comment: replyText.trim(),
            createdAt: new Date().toISOString()
          }]
        });
        setReplyText('');
        setActiveReplyId(null);
        fetchReviews();
      }
    } catch (e) {
      console.error("Failed to add reply", e);
    }
  };

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111111] rounded-[2rem] shadow-2xl z-[101] custom-scrollbar"
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
                      onClick={async () => {
                        if (!user) {
                          alert("Authenticate to like places.");
                          return;
                        }
                        if (place) {
                           const newStatus = !isLiked;
                           setIsLiked(newStatus);
                           try {
                             await fetch('/api/interactions', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ user_id: user.uid, place_id: place.place_id || (place as any)._id, interaction_type: newStatus ? 'like' : 'unlike' })
                             });
                           } catch(e) {
                             setIsLiked(!newStatus);
                             console.error("Failed to update liked status", e);
                           }
                        }
                      }}
                      className={cn("backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2", 
                        isLiked ? "bg-[#E60023] text-white" : "bg-black/40 hover:bg-black/60 text-white")}
                    >
                      <Heart className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
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
                <div className="flex items-center gap-2 text-[#767676] dark:text-zinc-400">
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
                      <span key={tag} className="px-4 py-2 bg-zinc-100 dark:bg-[#E9E9E9] dark:bg-[#333333] text-zinc-700 dark:text-zinc-300 rounded-xl font-medium text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#FFFFFF15]">
                <h3 className="text-xl font-display font-bold text-[#E60023] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reviews
                </h3>

                {user && (
                  <div className="mb-8 bg-[#161B22]/50 p-4 rounded-2xl border border-[#FFFFFF15]">
                    <div className="flex gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#F0F0F0] flex justify-center items-center">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-[#E2E8F0]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Log your experience here..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="w-full bg-white dark:bg-[#222222] text-[#111111] dark:text-[#F0F0F0] placeholder-zinc-500 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#E60023] border border-[#E9E9E9] dark:border-[#333333] resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pl-13">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className={`p-1 ${star <= newReviewRating ? 'text-[#E60023]' : 'text-zinc-600'}`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleAddReview}
                        disabled={isSubmitting || !newReviewText.trim()}
                        className="bg-[#E60023] hover:bg-[#cc0020] text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Logging...' : 'Post Review'}
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {loadingReviews ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-[#161B22] rounded-2xl"></div>
                      <div className="h-24 bg-[#161B22] rounded-2xl"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-[#767676] dark:text-[#A0A0A0] text-center py-4">No intel logged for this location yet.</p>
                  ) : (
                    reviews.map((review, index) => (
                      <div 
                        key={review.id} 
                        className="p-5 rounded-2xl bg-[#161B22] border border-[#FFFFFF15] flex gap-4"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#F0F0F0] flex justify-center items-center cursor-pointer hover:border-2 hover:border-[#D4AF37] transition-all" onClick={() => alert(`Navigating to ${review.reviewer_name}'s secure profile...`)}>
                          {review.reviewer_photo ? (
                            <img src={review.reviewer_photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-[#E2E8F0]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p 
                              className="font-bold text-[#E2E8F0] cursor-pointer hover:text-[#E60023] transition-colors"
                              onClick={() => alert(`Navigating to ${review.reviewer_name}'s secure profile...`)}
                            >
                              {review.reviewer_name || 'Anonymous Explorer'}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-[#E60023]" />
                              <span className="text-sm font-medium text-[#E2E8F0]">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                            {review.comment}
                          </p>
                          <div className="flex items-center justify-between mt-3 text-xs font-bold text-[#767676] dark:text-[#A0A0A0]">
                            <div className="flex gap-4">
                              <button 
                                onClick={() => handleLike(review, false)}
                                className={cn("flex items-center gap-1 hover:text-[#006CE4] transition-colors", review.likes?.includes(user?.uid || '') && "text-[#006CE4]")}>
                                <ThumbsUp className="w-3 h-3" />
                                {review.likes?.length || 0}
                              </button>
                              <button 
                                onClick={() => handleLike(review, true)}
                                className={cn("flex items-center gap-1 hover:text-[#FF4B4B] transition-colors", review.dislikes?.includes(user?.uid || '') && "text-[#FF4B4B]")}>
                                <ThumbsDown className="w-3 h-3" />
                                {review.dislikes?.length || 0}
                              </button>
                              <button 
                                onClick={() => setActiveReplyId(activeReplyId === review.id ? null : review.id)}
                                className="flex items-center gap-1 hover:text-[#006CE4] transition-colors">
                                <MessageSquare className="w-3 h-3" />
                                Reply
                              </button>
                            </div>
                          </div>
                          
                          {/* Replies */}
                          {(review.replies?.length ?? 0) > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-[#FFFFFF15] space-y-3">
                              {review.replies!.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#F0F0F0] flex justify-center items-center">
                                    {reply.reviewer_photo ? (
                                      <img src={reply.reviewer_photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <UserIcon className="w-4 h-4 text-[#E2E8F0]" />
                                    )}
                                  </div>
                                  <div className="flex-1 bg-[#F0F0F0]/50 rounded-xl p-3 text-sm">
                                    <p className="font-bold text-[#E2E8F0] mb-1">{reply.reviewer_name}</p>
                                    <p className="text-zinc-400">{reply.comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {activeReplyId === review.id && user && (
                            <div className="mt-3 flex gap-2">
                              <input 
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Add a reply..."
                                className="flex-1 bg-[#F0F0F0] text-white text-sm rounded-lg px-3 py-2 border border-[#FFFFFF15] focus:outline-none focus:border-[#D4AF37]"
                              />
                              <button 
                                onClick={() => submitReply(review.id)}
                                disabled={!replyText.trim()}
                                className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                              >
                                Send
                              </button>
                            </div>
                          )}
                        </div>
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
