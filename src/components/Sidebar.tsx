import React, { useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Compass, Search, Map, User as UserIcon, LogIn, LogOut, Plane, Loader2, Users, Bell, MessageCircle, Moon, Sun, Globe } from 'lucide-react';
import TrekLogo from './TrekLogo';
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'feed', label: 'Feed', icon: Globe },
    { id: 'search', label: 'Intel', icon: Search },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'friends', label: 'Squad', icon: Users },
    { id: 'messages', label: 'Chat', icon: MessageCircle },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            following: [],
            followers: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } else {
          await updateDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLogin: new Date().toISOString()
          });
        }
      }
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
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white dark:bg-[#111111] border-b border-[#E9E9E9] dark:border-[#333333] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E60023] rounded-full flex items-center justify-center shadow-lg">
            <TrekLogo className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-[#E60023]">TREK</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-[#111111] dark:text-[#F0F0F0]">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#E9E9E9] dark:border-[#333333] shadow-sm bg-[#E9E9E9] dark:bg-[#333333] flex items-center justify-center text-[#111111] dark:text-[#F0F0F0] font-bold overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 h-screen bg-white dark:bg-[#111111] flex-col p-6 fixed left-0 top-0 z-50 transition-colors duration-500 border-r border-[#E9E9E9] dark:border-[#333333]">
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E60023] rounded-full flex items-center justify-center shadow-sm">
              <TrekLogo className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-widest text-[#E60023] uppercase">TREK</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-full transition-all duration-200 group relative z-10",
                activeTab === item.id
                  ? "text-[#111111] dark:text-[#F0F0F0] font-bold"
                  : "text-[#111111] dark:text-[#F0F0F0]/70 hover:bg-[#E9E9E9] dark:bg-[#333333]/50 font-bold"
              )}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-desktop"
                  className="absolute inset-0 bg-[#E9E9E9] dark:bg-[#333333] rounded-full z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#E9E9E9] dark:border-[#333333] space-y-4">
          <button 
            onClick={toggleTheme} 
            className="w-full flex items-center justify-between px-4 py-3 bg-[#f0f0f0] dark:bg-[#333333] rounded-xl text-[#111111] dark:text-[#F0F0F0] font-bold transition-colors"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${isDark ? 'bg-[#E60023]' : 'bg-[#111111]/20'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          {user ? (
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-full border border-[#E9E9E9] dark:border-[#333333] bg-white dark:bg-[#111111] flex items-center justify-center text-[#111111] dark:text-[#F0F0F0] font-bold overflow-hidden shrink-0 shadow-sm">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate text-[#111111] dark:text-[#F0F0F0]">{user.displayName}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#111111] dark:text-[#F0F0F0]/50 hover:text-[#111111] dark:text-[#F0F0F0] flex items-center gap-1 mt-0.5 font-semibold transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-4 bg-[#E60023] text-white rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#cc0020] transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {isLoggingIn ? 'Connecting...' : 'Sign In'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111111] border-t border-[#E9E9E9] dark:border-[#333333] z-50 pb-safe">
        <div className="flex items-center justify-around p-3 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 relative z-10",
                activeTab === item.id
                  ? "text-[#E60023]"
                  : "text-[#111111] dark:text-[#F0F0F0]/50 hover:text-[#111111] dark:text-[#F0F0F0]"
              )}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-mobile"
                  className="absolute inset-0 bg-[#E60023]/10 rounded-xl z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 transition-colors",
                activeTab === item.id ? "text-[#E60023]" : ""
              )} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
