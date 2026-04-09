/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Discover from './components/Discover';
import Search from './components/Search';
import Roadmap from './components/Roadmap';
import Profile from './components/Profile';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');

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
      <div className="flex min-h-screen bg-zinc-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 ml-72 p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-8 right-8 pointer-events-none select-none opacity-10">
          <h1 className="text-9xl font-display font-black tracking-tighter text-zinc-900">
            TRAVEL
          </h1>
        </div>
      </div>
    </ErrorBoundary>
  );
}
