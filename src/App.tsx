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
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Feed from './components/Feed';
import AIIsland from './components/AIIsland';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Globe } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [user] = useAuthState(auth);

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discover setActiveTab={setActiveTab} />;
      case 'feed':
        return <Feed />;
      case 'search':
        return <Search />;
      case 'roadmap':
        return <Roadmap />;
      case 'friends':
        return <Friends />;
      case 'messages':
        return <Messages setActiveTab={setActiveTab} />;
      case 'notifications':
        return <Notifications setActiveTab={setActiveTab} />;
      case 'profile':
        return <Profile />;
      default:
        return <Discover setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-500 relative overflow-hidden bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F0F0F0]">
        
        {/* Simple crisp background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-white dark:bg-[#111111]">
        </div>

        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        />
        
        <main className="flex-1 w-full md:ml-72 p-6 pb-28 md:p-12 md:pb-12 z-10 relative">
          
          <AIIsland setActiveTab={setActiveTab} />

          {/* Desktop Global Header */}
          {user && (
            <div className="hidden md:flex absolute top-6 right-8 lg:right-12 z-50 items-center gap-3 bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#333333] px-5 py-2.5 rounded-full shadow-sm">
              <span className="text-sm font-bold text-[#111111] dark:text-[#F0F0F0]">{user.displayName || user.email?.split('@')[0]}</span>
              <div className="w-9 h-9 rounded-full border border-[#E9E9E9] dark:border-[#333333] bg-[#E9E9E9] dark:bg-[#333333] flex items-center justify-center text-[#111111] dark:text-[#F0F0F0] font-bold overflow-hidden shrink-0">
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
