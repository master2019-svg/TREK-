import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, documentId, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TravelPreference, Place } from '../types';
import { Save, Loader2, CheckCircle2, Globe, DollarSign, Users, Accessibility, Tag, LayoutGrid, User as UserIcon, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import LoginButton from './LoginButton';
import PlaceCard from './PlaceCard';
import PlaceDetailsModal from './PlaceDetailsModal';

const ALL_CATEGORIES = ['Historical', 'Nature', 'Beach', 'Food', 'City', 'Adventure', 'Wine Tour', 'Cultural'];
const ALL_TAGS = ['Castles', 'Hiking', 'Architecture', 'Luxury', 'Wildlife', 'Scenic', 'Nightlife', 'Restaurants', 'Wine', 'Museums', 'Beaches', 'Kayaking', 'Cycling', 'Skiing', 'Photography', 'Hot Air Balloon', 'Shopping', 'Bars', 'Concerts', 'Spa'];

export default function Profile() {
  const [user] = useAuthState(auth);
  const [nickname, setNickname] = useState('');
  const [prefs, setPrefs] = useState<Partial<TravelPreference>>({
    destinations: [],
    travel_dates: '',
    accessibility_needs: [],
    budget: 'medium',
    group_type: 'solo',
    categories: [],
    tags: []
  });
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const prefSnap = await getDoc(doc(db, "user_travel_preferences", user.uid));
        if (prefSnap.exists()) {
          const data = prefSnap.data();
          setPrefs({
            ...data,
            categories: data.categories || [],
            tags: data.tags || []
          });
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().nickname) {
          setNickname(userSnap.data().nickname);
        }

        const q = query(collection(db, "interactions"), where("user_id", "==", user.uid), where("interaction_type", "==", "like"));
        const querySnapshot = await getDocs(q);
        const likedPlaceIds = querySnapshot.docs.map(doc => doc.data().place_id);
        
        if (likedPlaceIds.length > 0) {
          const places = [];
          for (let i = 0; i < likedPlaceIds.length; i += 10) {
            const chunk = likedPlaceIds.slice(i, i + 10);
            const placesQuery = query(collection(db, "places"), where(documentId(), "in", chunk));
            const placesSnap = await getDocs(placesQuery);
            places.push(...placesSnap.docs.map(doc => ({ place_id: doc.id, ...doc.data() } as Place)));
          }
          setLikedPlaces(places);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { nickname });

      await setDoc(doc(db, "user_travel_preferences", user.uid), {
        ...prefs,
        user_id: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    const current = prefs.categories || [];
    if (current.includes(category)) {
      setPrefs({ ...prefs, categories: current.filter(c => c !== category) });
    } else {
      setPrefs({ ...prefs, categories: [...current, category] });
    }
  };

  const toggleTag = (tag: string) => {
    const current = prefs.tags || [];
    if (current.includes(tag)) {
      setPrefs({ ...prefs, tags: current.filter(t => t !== tag) });
    } else {
      setPrefs({ ...prefs, tags: [...current, tag] });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-trek-green animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-trek-green/20">
          <UserIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-display font-black mb-4 dark:text-white">Your Travel Identity</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          Sign in to customize your travel preferences and get personalized recommendations.
        </p>
        <LoginButton />
      </div>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2">Travel Profile</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Customize how we curate your travel experiences.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-trek-green text-white rounded-full font-bold flex items-center gap-3 hover:bg-trek-dark transition-all shadow-lg shadow-trek-green/30 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved' : 'Finish'}
        </motion.button>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Nickname */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-3 border-t-4 border-t-trek-green">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-trek-green/10 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-trek-green" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold dark:text-white">Your Nickname</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This is how you will appear to other travelers.</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Choose a unique nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-5 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-trek-green transition-all dark:text-white shadow-inner text-lg font-medium"
          />
        </motion.div>

        {/* Categories */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-teal-500" />
            </div>
            <h3 className="text-2xl font-display font-bold dark:text-white">Select Categories</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_CATEGORIES.map((category) => {
              const isSelected = prefs.categories?.includes(category);
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-trek-green text-white shadow-md shadow-trek-green/30' 
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-zinc-100 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  {category}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-display font-bold dark:text-white">Budget</h3>
          </div>
          <div className="flex flex-col gap-3">
            {['low', 'medium', 'high', 'luxury'].map((level) => (
              <button
                key={level}
                onClick={() => setPrefs({ ...prefs, budget: level as any })}
                className={`py-3 px-4 rounded-xl font-bold capitalize transition-all text-left flex justify-between items-center ${
                  prefs.budget === level ? 'bg-trek-green text-white shadow-md shadow-trek-green/30' : 'bg-white/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-800'
                }`}
              >
                {level}
                {prefs.budget === level && <CheckCircle2 className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Tag className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-display font-bold dark:text-white">Select Tags</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_TAGS.map((tag) => {
              const isSelected = prefs.tags?.includes(tag);
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-trek-green text-white shadow-md shadow-trek-green/30' 
                      : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-zinc-100 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Destinations */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-display font-bold dark:text-white">Destinations</h3>
          </div>
          <input
            type="text"
            placeholder="e.g. France, Japan"
            value={prefs.destinations?.join(', ')}
            onChange={(e) => setPrefs({ ...prefs, destinations: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full p-4 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-trek-green transition-all dark:text-white shadow-inner"
          />
        </motion.div>

        {/* Group Type */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-display font-bold dark:text-white">Travel Group</h3>
          </div>
          <select
            value={prefs.group_type}
            onChange={(e) => setPrefs({ ...prefs, group_type: e.target.value })}
            className="w-full p-4 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-trek-green transition-all appearance-none dark:text-white shadow-inner font-bold"
          >
            <option value="solo">Solo Traveler</option>
            <option value="couple">Couple</option>
            <option value="family">Family with Kids</option>
            <option value="friends">Group of Friends</option>
          </select>
        </motion.div>

        {/* Accessibility */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-xl font-display font-bold dark:text-white">Accessibility</h3>
          </div>
          <div className="space-y-3">
            {['Wheelchair Access', 'Low Mobility', 'Visual Aid', 'Hearing Support'].map((need) => (
              <label key={need} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.accessibility_needs?.includes(need)}
                  onChange={(e) => {
                    const current = prefs.accessibility_needs || [];
                    if (e.target.checked) {
                      setPrefs({ ...prefs, accessibility_needs: [...current, need] });
                    } else {
                      setPrefs({ ...prefs, accessibility_needs: current.filter(n => n !== need) });
                    }
                  }}
                  className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 text-trek-green focus:ring-trek-green dark:bg-zinc-900"
                />
                <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors font-medium">{need}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Liked Places Section */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] space-y-6 md:col-span-3 border-t-4 border-t-rose-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold dark:text-white">Your Liked Places</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Places you've loved and saved for later.</p>
            </div>
          </div>
          
          {likedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {likedPlaces.map((place) => (
                <div key={place.place_id} onClick={() => setSelectedPlace(place)} className="cursor-pointer h-full">
                  <PlaceCard place={place} isLiked={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/30 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <Heart className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">You haven't liked any places yet.</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Explore and heart your favorite destinations!</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <PlaceDetailsModal 
        place={selectedPlace} 
        isOpen={!!selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />
    </div>
  );
}
