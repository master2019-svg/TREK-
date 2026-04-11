import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TravelPreference } from '../types';
import { Save, Loader2, CheckCircle2, Globe, DollarSign, Users, Accessibility, Tag, LayoutGrid, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

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
        const prefResponse = await fetch(`/api/preferences/${user.uid}`);
        const prefResult = await prefResponse.json();
        if (prefResult.data && Object.keys(prefResult.data).length > 0) {
          setPrefs({
            ...prefResult.data,
            categories: prefResult.data.categories || [],
            tags: prefResult.data.tags || []
          });
        }

        const userResponse = await fetch(`/api/users/${user.uid}`);
        const userResult = await userResponse.json();
        if (userResult.data && userResult.data.nickname) {
          setNickname(userResult.data.nickname);
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
      await fetch('/api/users/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, nickname })
      });

      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prefs, user_id: user.uid })
      });
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
        <h2 className="text-2xl font-display font-bold mb-3 dark:text-white">Your Travel Identity</h2>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Sign in to customize your travel preferences and get personalized recommendations.
        </p>
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
      </motion.div>
    </div>
  );
}
