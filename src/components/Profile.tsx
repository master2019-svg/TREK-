import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, documentId, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TravelPreference, Place } from '../types';
import { Save, Loader2, CheckCircle2, Globe, DollarSign, Users, Accessibility, Tag, LayoutGrid, User as UserIcon, Heart, Star, ChevronRight, Shield, Moon, Compass, Coffee, Lock, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import LoginButton from './LoginButton';
import PlaceCard from './PlaceCard';
import PlaceDetailsModal from './PlaceDetailsModal';
import PlaceImage from './PlaceImage';

const ALL_CATEGORIES = ['Historical', 'Nature', 'Beach', 'Food', 'City', 'Adventure', 'Wine Tour', 'Cultural'];
const ALL_TAGS = ['Castles', 'Hiking', 'Architecture', 'Luxury', 'Wildlife', 'Scenic', 'Nightlife', 'Restaurants', 'Wine', 'Museums', 'Beaches', 'Kayaking', 'Cycling', 'Skiing', 'Photography', 'Hot Air Balloon', 'Shopping', 'Bars', 'Concerts', 'Spa'];

interface LikedPlaceData {
  place: Place;
  interactionId: string;
  notes: string;
  rating: number;
}

export default function Profile() {
  const [user, authLoading] = useAuthState(auth);
  const [nickname, setNickname] = useState('');
  const [prefs, setPrefs] = useState<Partial<TravelPreference>>({
    destinations: [],
    travel_dates: '',
    accessibility_needs: [],
    budget: 'medium',
    group_type: 'solo',
    categories: [],
    tags: [],
    notification_preferences: {
      followers: true,
      messages: true,
      recommendations: true
    }
  });
  const [likedPlaces, setLikedPlaces] = useState<LikedPlaceData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
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
        
        const interactionsMap = new Map();
        querySnapshot.docs.forEach(doc => {
          interactionsMap.set(doc.data().place_id, { id: doc.id, ...doc.data() });
        });
        
        const likedPlaceIds = Array.from(interactionsMap.keys());
        
        if (likedPlaceIds.length > 0) {
          const places = [];
          for (let i = 0; i < likedPlaceIds.length; i += 10) {
            const chunk = likedPlaceIds.slice(i, i + 10);
            const placesQuery = query(collection(db, "places"), where(documentId(), "in", chunk));
            const placesSnap = await getDocs(placesQuery);
            places.push(...placesSnap.docs.map(doc => ({ place_id: doc.id, ...doc.data() } as Place)));
          }
          
          const combined = places.map(p => ({
            place: p,
            interactionId: interactionsMap.get(p.place_id).id,
            notes: interactionsMap.get(p.place_id).notes || '',
            rating: interactionsMap.get(p.place_id).rating || 0
          }));
          
          setLikedPlaces(combined);
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

  const handleInteractionUpdate = async (interactionId: string, field: 'notes' | 'rating', value: any) => {
    try {
      await updateDoc(doc(db, "interactions", interactionId), { [field]: value });
      setLikedPlaces(prev => prev.map(p => 
        p.interactionId === interactionId ? { ...p, [field]: value } : p
      ));
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
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

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-trek-green animate-spin" />
        <p className="text-[#767676] dark:text-[#111111] dark:text-[#F0F0F0] font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-[#E60023] rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <UserIcon className="w-12 h-12 text-[#0D1117]" />
        </div>
        <h2 className="text-4xl font-display font-black mb-4 text-[#111111] dark:text-[#F0F0F0]">Dossier</h2>
        <p className="text-[#111111] dark:text-[#F0F0F0] text-lg leading-relaxed mb-8">
          Authenticate to establish your travel identity and sync preferences.
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
    <div className="max-w-5xl mx-auto space-y-12 pb-20 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "Profile"} className="w-20 h-20 rounded-full border border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] text-[#E60023] flex items-center justify-center text-3xl font-display font-bold shadow-xl">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold text-[#111111] dark:text-[#F0F0F0] tracking-tight mb-1">Dossier Profile</h2>
            <p className="text-[#767676] dark:text-[#A0A0A0] font-mono text-sm uppercase tracking-widest">Clearance Level: VIP</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#E60023] text-[#0D1117] rounded-xl font-bold flex items-center gap-3 hover:bg-[#b8952b] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Secured' : 'Lock Profile'}
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
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-3 border-t-2 border-t-[#E60023]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-[#E60023]" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Callsign</h3>
              <p className="text-sm text-[#767676] dark:text-[#A0A0A0]">Your network alias.</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Choose callsign..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-4 bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] rounded-xl focus:outline-none focus:border-[#D4AF37]/50 transition-all text-[#111111] dark:text-[#F0F0F0] text-lg tracking-wide"
          />
        </motion.div>

        {/* Categories */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Target Sectors</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((category) => {
              const isSelected = prefs.categories?.includes(category);
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 text-sm rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-[#E60023] text-white shadow-sm border border-[#E60023]' 
                      : 'bg-[#E9E9E9] dark:bg-[#333333] text-[#111111] dark:text-[#F0F0F0] hover:text-[#111111] dark:text-[#F0F0F0] border border-[#E9E9E9] dark:border-[#333333]'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  {category}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Funding</h3>
          </div>
          <div className="flex flex-col gap-2">
            {['low', 'medium', 'high', 'luxury'].map((level) => (
              <button
                key={level}
                onClick={() => setPrefs({ ...prefs, budget: level as any })}
                className={`py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all text-left flex justify-between items-center ${
                  prefs.budget === level ? 'bg-[#E60023] text-[#0D1117]' : 'bg-[#E9E9E9] dark:bg-[#333333] text-[#767676] dark:text-[#A0A0A0] border border-[#E9E9E9] dark:border-[#333333]'
                }`}
              >
                {level}
                {prefs.budget === level && <CheckCircle2 className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Intel Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const isSelected = prefs.tags?.includes(tag);
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-[#E60023] text-white text-[#E60023] border border-[#E60023]' 
                      : 'bg-[#E9E9E9] dark:bg-[#333333] text-[#767676] dark:text-[#A0A0A0] border border-[#E9E9E9] dark:border-[#333333] hover:border-[#FFFFFF30]'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Destinations */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Coordinates</h3>
          </div>
          <input
            type="text"
            placeholder="e.g. France, Japan"
            value={prefs.destinations?.join(', ')}
            onChange={(e) => setPrefs({ ...prefs, destinations: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full p-4 bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] rounded-xl focus:outline-none focus:border-[#D4AF37]/50 transition-all text-[#111111] dark:text-[#F0F0F0]"
          />
        </motion.div>

        {/* Group Type */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Squad Size</h3>
          </div>
          <select
            value={prefs.group_type}
            onChange={(e) => setPrefs({ ...prefs, group_type: e.target.value })}
            className="w-full p-4 bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] rounded-xl focus:outline-none focus:border-[#D4AF37]/50 transition-all appearance-none text-[#111111] dark:text-[#F0F0F0] font-bold"
          >
            <option value="solo">Lone Wolf</option>
            <option value="couple">Duo</option>
            <option value="family">Family Unit</option>
            <option value="friends">Squad</option>
          </select>
        </motion.div>

        {/* Accessibility */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-[#E60023]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Support</h3>
          </div>
          <div className="space-y-3">
            {['Wheelchair Access', 'Low Mobility', 'Visual Aid', 'Hearing Support'].map((need) => (
              <label key={need} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-[#E9E9E9] dark:bg-[#333333] transition-colors">
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
                  className="w-5 h-5 rounded-md bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] text-[#E60023] focus:ring-[#D4AF37]"
                />
                <span className="text-[#111111] dark:text-[#F0F0F0] group-hover:text-[#111111] dark:text-[#F0F0F0] transition-colors text-sm font-bold uppercase tracking-wider">{need}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Gamification / Notification Preferences */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-3 border-t-4 border-t-[#E60023]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E9E9E9] dark:bg-[#333333] flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#E60023]" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Push Notifications</h3>
                <p className="text-sm text-[#767676] dark:text-[#A0A0A0]">Manage your alerts and updates.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { id: 'followers', label: 'New Followers', desc: 'When someone follows you.' },
              { id: 'messages', label: 'Direct Messages', desc: 'When you receive a message.' },
              { id: 'recommendations', label: 'Recommendations', desc: 'Personalized travel ideas.' }
            ].map(setting => (
              <div key={setting.id} className="bg-[#f0f0f0] dark:bg-[#1f1f1f] rounded-2xl p-6 border border-[#E9E9E9] dark:border-[#333333] flex flex-col relative">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-[#111111] dark:text-[#F0F0F0] tracking-wide">{setting.label}</h4>
                   <button 
                     onClick={() => {
                        setPrefs(prev => ({
                          ...prev,
                          notification_preferences: {
                            ...prev.notification_preferences,
                            [setting.id]: !(prev.notification_preferences as any)?.[setting.id]
                          }
                        }))
                     }}
                     className={`w-12 h-6 rounded-full transition-colors relative ${((prefs.notification_preferences as any)?.[setting.id] !== false) ? 'bg-[#E60023]' : 'bg-[#ccc]'}`}
                   >
                     <div className={`w-4 h-4 bg-white dark:bg-[#111111] rounded-full absolute top-1 transition-transform ${((prefs.notification_preferences as any)?.[setting.id] !== false) ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>
                 <p className="text-xs text-[#767676] dark:text-[#A0A0A0]">{setting.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Liked Places Section */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] p-8 rounded-[2rem] space-y-6 md:col-span-3 border-t-2 border-t-[#E60023]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#E60023]" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#111111] dark:text-[#F0F0F0]">Secured Targets</h3>
              <p className="text-sm text-[#767676] dark:text-[#A0A0A0]">Locations archived for deployment.</p>
            </div>
          </div>
          
          {likedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {likedPlaces.map((item) => (
                <div key={item.interactionId} className="bg-[#E9E9E9] dark:bg-[#333333] rounded-2xl p-5 border border-[#E9E9E9] dark:border-[#333333] flex flex-col gap-4 relative overflow-hidden group hover:border-[#D4AF37]/50 transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4B4B]/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  <div className="flex gap-4 items-start relative z-10">
                      <PlaceImage place={item.place} className="w-24 h-24 rounded-xl object-cover shadow-lg border border-[#E9E9E9] dark:border-[#333333]" />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-[#111111] dark:text-[#F0F0F0] line-clamp-1">{item.place.name}</h4>
                      <p className="text-xs text-[#E60023] uppercase tracking-wider mb-2 font-bold">{item.place.location.city}, {item.place.location.country}</p>
                      <button 
                        onClick={() => setSelectedPlace(item.place)} 
                        className="text-xs text-[#111111] dark:text-[#F0F0F0] hover:text-[#E60023] font-bold flex items-center gap-1 transition-colors uppercase tracking-widest mt-4"
                      >
                        Inspect Dossier <ChevronRight className="w-4 h-4 text-[#E60023]" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#111111] rounded-xl p-4 space-y-4 border border-[#FFFFFF05] relative z-10">
                    <div>
                      <label className="text-[10px] font-bold text-[#767676] dark:text-[#A0A0A0] uppercase tracking-widest mb-2 block">Agent Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            onClick={() => handleInteractionUpdate(item.interactionId, 'rating', star)}
                            className={`w-5 h-5 cursor-pointer transition-colors ${
                              item.rating >= star 
                                ? 'fill-[#D4AF37] text-[#E60023]' 
                                : 'text-zinc-600 hover:text-[#E60023]/50'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#767676] dark:text-[#A0A0A0] uppercase tracking-widest mb-2 block">Field Notes</label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => {
                          setLikedPlaces(prev => prev.map(p => 
                            p.interactionId === item.interactionId ? { ...p, notes: e.target.value } : p
                          ));
                        }}
                        onBlur={(e) => handleInteractionUpdate(item.interactionId, 'notes', e.target.value)}
                        className="w-full bg-[#E9E9E9] dark:bg-[#333333] border border-[#E9E9E9] dark:border-[#333333] rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37]/30 text-[#111111] dark:text-[#F0F0F0] resize-none"
                        placeholder="Log classified findings..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#E9E9E9] dark:bg-[#333333] rounded-3xl border lg border-[#FFFFFF05] border-dashed">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-[#111111] dark:text-[#F0F0F0] font-medium tracking-wide">No targets secured yet.</p>
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
