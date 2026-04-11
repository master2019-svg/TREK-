import React from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Compass, Search, Map, User as UserIcon, LogIn, LogOut, Plane, Loader2, Moon, Sun, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }: SidebarProps) {
  const [user] = useAuthState(auth);

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'roadmap', label: 'My Roadmap', icon: Map },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Travel Profile', icon: UserIcon },
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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 h-screen glass border-r border-zinc-200 dark:border-zinc-800 flex-col p-6 fixed left-0 top-0 z-50 transition-colors duration-500">
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-trek-green/20">
              <Plane className="text-white w-6 h-6 -rotate-45" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-tight text-gradient">TREK</h1>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </motion.button>
        </div>

        <nav className="flex-1 space-y-2 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative z-10",
                activeTab === item.id
                  ? "text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-desktop"
                  className="absolute inset-0 bg-gradient-primary rounded-2xl shadow-lg shadow-trek-green/20 z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                activeTab === item.id ? "text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
              )} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {user ? (
            <div className="flex items-center gap-4 px-2">
              <img
                src={user.photoURL || ''}
                alt={user.displayName || ''}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate dark:text-white">{user.displayName}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 mt-0.5 font-medium transition-colors"
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
              className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-zinc-200 dark:border-zinc-800 z-50 pb-safe">
        <div className="flex items-center justify-around p-3 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 relative z-10",
                activeTab === item.id
                  ? "text-trek-green"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-mobile"
                  className="absolute inset-0 bg-trek-green/10 dark:bg-trek-green/20 rounded-xl z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 transition-colors",
                activeTab === item.id ? "text-trek-green drop-shadow-md" : ""
              )} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
          
          {/* Mobile Dark Mode Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </motion.div>
            <span className="text-[10px] font-bold">Theme</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
