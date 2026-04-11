import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Search, UserPlus, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Friends() {
  const [user] = useAuthState(auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.uid}/stats`)
        .then(res => res.json())
        .then(result => {
          if (result.data) {
            setStats(result.data);
          }
        })
        .catch(err => console.error("Failed to fetch stats:", err));
    }
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (result.data) {
        // Filter out current user
        setResults(result.data.filter((u: any) => u.uid !== user?.uid));
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (friendId: string) => {
    if (!user) return;
    
    try {
      await fetch('/api/friends/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, friend_id: friendId })
      });
      setFollowing(prev => new Set(prev).add(friendId));
      setStats(prev => ({ ...prev, following: prev.following + 1 }));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <h2 className="text-2xl font-display font-bold mb-3 dark:text-white">Find Travel Buddies</h2>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Sign in to connect with friends and see their travel recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white">
          Find <span className="text-gradient">Friends</span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Follow friends to blend their favorite places into your discovery feed.
        </p>
        
        <div className="flex justify-center gap-8 pt-4">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.followers}</span>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Followers</span>
          </div>
          <div className="w-px bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.following}</span>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Following</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-focus-within:text-trek-green transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by nickname, name or email..."
          className="w-full h-16 pl-16 pr-32 glass rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-trek-green/50 transition-all shadow-sm dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-3 top-3 bottom-3 px-6 bg-trek-green text-white rounded-xl font-bold hover:bg-trek-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-trek-green" />
            Results
          </h3>
          <div className="grid gap-4">
            {results.map((u) => {
              const isFollowing = following.has(u.uid);
              return (
                <div key={u.uid} className="glass p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-trek-green/10 dark:bg-trek-green/20 rounded-full flex items-center justify-center text-trek-green dark:text-trek-green font-bold text-xl overflow-hidden">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white">
                        {u.nickname ? u.nickname : (u.displayName || 'Traveler')}
                      </h4>
                      {u.nickname && u.displayName && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{u.displayName}</p>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={!isFollowing ? { scale: 1.05 } : {}}
                    whileTap={!isFollowing ? { scale: 0.95 } : {}}
                    animate={isFollowing ? {
                      backgroundColor: 'var(--tw-colors-zinc-100)',
                      color: 'var(--tw-colors-zinc-500)',
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleFollow(u.uid)}
                    disabled={isFollowing}
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
                      isFollowing
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-default'
                        : 'bg-trek-green/10 dark:bg-trek-green/20 text-trek-green dark:text-trek-green hover:bg-trek-green/20 dark:hover:bg-trek-green/30'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">No users found matching "{query}".</p>
        </div>
      )}
    </div>
  );
}
