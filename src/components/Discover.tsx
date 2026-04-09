import React, { useEffect, useState } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';

export default function Discover() {
  const [user] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInteractions, setUserInteractions] = useState<{liked: Set<string>, saved: Set<string>}>({
    liked: new Set(),
    saved: new Set()
  });

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      const q = query(collection(db, 'interactions'), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const liked = new Set<string>();
      const saved = new Set<string>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.interaction_type === 'like') liked.add(data.place_id);
        if (data.interaction_type === 'save') saved.add(data.place_id);
      });
      setUserInteractions({ liked, saved });
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
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium">Curating your personalized travel guide...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
          <Sparkles className="text-zinc-400 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-3">Sign in to Discover</h2>
        <p className="text-zinc-500 leading-relaxed">
          Log in to unlock personalized travel recommendations based on your preferences and travel style.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-zinc-900 mb-2">Discover Places</h2>
          <p className="text-zinc-500">Handpicked destinations based on your unique travel profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {places.map((place, index) => (
          <motion.div
            key={place.place_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlaceCard
              place={place}
              isLiked={userInteractions.liked.has(place.place_id)}
              isSaved={userInteractions.saved.has(place.place_id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
