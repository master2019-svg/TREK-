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
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { Plane } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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
              <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <Plane className="text-white w-12 h-12 -rotate-45" />
              </div>
              <h1 className="text-5xl font-display font-black tracking-tight text-gradient">TREK</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-500 relative overflow-hidden">
        
        {/* Animated Background Blobs - Maldives Theme */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[100px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-500/20 dark:bg-teal-600/10 blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-sky-500/20 dark:bg-sky-600/10 blur-[100px] animate-blob animation-delay-4000" />
        </div>

        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main className="flex-1 w-full md:ml-72 p-6 pb-28 md:p-12 md:pb-12 z-10">
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
