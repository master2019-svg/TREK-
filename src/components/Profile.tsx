import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TravelPreference } from '../types';
import { Save, Loader2, CheckCircle2, Globe, DollarSign, Users, Accessibility } from 'lucide-react';

export default function Profile() {
  const [user] = useAuthState(auth);
  const [prefs, setPrefs] = useState<Partial<TravelPreference>>({
    destinations: [],
    travel_dates: '',
    accessibility_needs: [],
    budget: 'medium',
    group_type: 'solo'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/preferences/${user.uid}`);
        const result = await response.json();
        if (result.data && Object.keys(result.data).length > 0) {
          setPrefs(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-zinc-900 dark:text-white animate-spin" />
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
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2">Travel Profile</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Customize how we curate your travel experiences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg shadow-zinc-200 dark:shadow-none disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Preferences Saved' : 'Save Preferences'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Destinations */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-6 h-6 text-zinc-900 dark:text-white" />
            <h3 className="text-xl font-display font-bold dark:text-white">Dream Destinations</h3>
          </div>
          <input
            type="text"
            placeholder="e.g. France, Japan, Bali"
            value={prefs.destinations?.join(', ')}
            onChange={(e) => setPrefs({ ...prefs, destinations: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all dark:text-white"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">Separate multiple destinations with commas.</p>
        </div>

        {/* Budget */}
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-zinc-900 dark:text-white" />
            <h3 className="text-xl font-display font-bold dark:text-white">Budget Level</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['low', 'medium', 'high', 'luxury'].map((level) => (
              <button
                key={level}
                onClick={() => setPrefs({ ...prefs, budget: level as any })}
                className={`py-3 rounded-xl font-medium capitalize transition-all ${
                  prefs.budget === level ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
            <Users className="w-6 h-6 text-zinc-900 dark:text-white" />
            <h3 className="text-xl font-display font-bold dark:text-white">Travel Group</h3>
          </div>
          <select
            value={prefs.group_type}
            onChange={(e) => setPrefs({ ...prefs, group_type: e.target.value })}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all appearance-none dark:text-white"
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
            <Accessibility className="w-6 h-6 text-zinc-900 dark:text-white" />
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
                  className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-white dark:bg-zinc-900"
                />
                <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{need}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
