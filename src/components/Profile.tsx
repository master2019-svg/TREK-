import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TravelPreference } from '../types';
import { Save, Loader2, CheckCircle2, Globe, DollarSign, Users, Accessibility, Tag, LayoutGrid, User as UserIcon } from 'lucide-react';

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
        // Fetch preferences
        const prefResponse = await fetch(`/api/preferences/${user.uid}`);
        const prefResult = await prefResponse.json();
        if (prefResult.data && Object.keys(prefResult.data).length > 0) {
          setPrefs({
            ...prefResult.data,
            categories: prefResult.data.categories || [],
            tags: prefResult.data.tags || []
          });
        }

        // Fetch user profile (for nickname)
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
      // Save nickname
      await fetch('/api/users/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, nickname })
      });

      // Save preferences
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
        <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin" />
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2">Travel Profile</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Customize how we curate your travel experiences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-teal-600 text-white rounded-full font-bold flex items-center gap-3 hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved' : 'Finish'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nickname */}
        <div className="glass p-8 rounded-[2rem] space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <UserIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-2xl font-display font-bold dark:text-white">Your Nickname</h3>
          </div>
          <input
            type="text"
            placeholder="Choose a unique nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-4 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:text-white shadow-sm"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">This is how you will appear to other travelers when they search for friends.</p>
        </div>

        {/* Categories */}
        <div className="glass p-8 rounded-[2rem] space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <LayoutGrid className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-2xl font-display font-bold dark:text-white">Select Categories</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_CATEGORIES.map((category) => {
              const isSelected = prefs.categories?.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="glass p-8 rounded-[2rem] space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-2xl font-display font-bold dark:text-white">Select Tags</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_TAGS.map((tag) => {
              const isSelected = prefs.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Destinations */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xl font-display font-bold dark:text-white">Dream Destinations</h3>
          </div>
          <input
            type="text"
            placeholder="e.g. France, Japan, Bali"
            value={prefs.destinations?.join(', ')}
            onChange={(e) => setPrefs({ ...prefs, destinations: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full p-4 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:text-white shadow-sm"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">Separate multiple destinations with commas.</p>
        </div>

        {/* Budget */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xl font-display font-bold dark:text-white">Budget Level</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['low', 'medium', 'high', 'luxury'].map((level) => (
              <button
                key={level}
                onClick={() => setPrefs({ ...prefs, budget: level as any })}
                className={`py-3 rounded-xl font-bold capitalize transition-all ${
                  prefs.budget === level ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'bg-white dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Group Type */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xl font-display font-bold dark:text-white">Travel Group</h3>
          </div>
          <select
            value={prefs.group_type}
            onChange={(e) => setPrefs({ ...prefs, group_type: e.target.value })}
            className="w-full p-4 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none dark:text-white shadow-sm font-bold"
          >
            <option value="solo">Solo Traveler</option>
            <option value="couple">Couple</option>
            <option value="family">Family with Kids</option>
            <option value="friends">Group of Friends</option>
          </select>
        </div>

        {/* Accessibility */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Accessibility className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xl font-display font-bold dark:text-white">Accessibility</h3>
          </div>
          <div className="space-y-3">
            {['Wheelchair Access', 'Low Mobility', 'Visual Aid', 'Hearing Support'].map((need) => (
              <label key={need} className="flex items-center gap-3 cursor-pointer group">
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
                  className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 text-teal-600 focus:ring-teal-500 dark:bg-zinc-900"
                />
                <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors font-medium">{need}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
