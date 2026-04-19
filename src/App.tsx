/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Discover from './components/Discover';
import Search from './components/Search';
import Roadmap from './components/Roadmap';
import Profile from './components/Profile';
import Friends from './components/Friends';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { Plane } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discover />;
      case 'search':
        return <Search />;
      case 'roadmap':
        return <Roadmap />;
      case 'friends':
        return <Friends />;
      case 'profile':
        return <Profile />;
      default:
        return <Discover />;
    }
  };

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-trek-green/30">
                <Plane className="text-white w-12 h-12 -rotate-45" />
              </div>
              <h1 className="text-5xl font-display font-black tracking-tight text-gradient">TREK</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-500 relative overflow-hidden bg-grid-pattern">
        
        {/* Advanced Animated Background Blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-trek-green/10 dark:bg-trek-green/5 blur-[120px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-500/10 dark:bg-teal-600/5 blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 dark:bg-emerald-600/5 blur-[120px] animate-blob animation-delay-4000" />
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-cyan-400/10 dark:bg-cyan-600/5 blur-[100px] animate-blob" style={{ animationDelay: '6s' }} />
        </div>

        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main className="flex-1 w-full md:ml-72 p-6 pb-28 md:p-12 md:pb-12 z-10 relative">
          
          {/* Desktop Global Header */}
          {user && (
            <div className="hidden md:flex absolute top-6 right-8 lg:right-12 z-50 items-center gap-3 glass px-5 py-2.5 rounded-full shadow-lg">
              <span className="text-sm font-bold dark:text-white">{user.displayName || user.email?.split('@')[0]}</span>
              <div className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm bg-trek-green/10 flex items-center justify-center text-trek-green font-bold overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}
