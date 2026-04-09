import React from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Compass, Search, Map, User as UserIcon, LogIn, LogOut, Plane, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [user] = useAuthState(auth);

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'roadmap', label: 'My Roadmap', icon: Map },
    { id: 'profile', label: 'Travel Profile', icon: UserIcon },
  ];

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup request was cancelled by a newer request.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup was closed by the user.');
      } else {
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-72 h-screen glass border-r border-zinc-200 flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
          <Plane className="text-white w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-xl font-display font-bold tracking-tight">TravelAI</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
              activeTab === item.id
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              activeTab === item.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-100">
        {user ? (
          <div className="flex items-center gap-4 px-2">
            <img
              src={user.photoURL || ''}
              alt={user.displayName || ''}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-red-500 flex items-center gap-1 mt-0.5"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
          </button>
        )}
      </div>
    </div>
  );
}
