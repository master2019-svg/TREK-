import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Sparkles, Bell } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';

export default function AIIsland({ setActiveTab }: { setActiveTab?: (t: string) => void }) {
  
  const [triggerState, setTriggerState] = useState<'idle' | 'location' | 'time' | 'alert'>('idle');
  const [user] = useAuthState(auth);
  const [latestAlert, setLatestAlert] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestAlert(snapshot.docs[0].data());
        setTriggerState('alert');
      } else {
        setTriggerState('idle');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Removed old mocked setTimeout blocks


  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-full max-w-sm px-4 flex justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={triggerState}
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          className={`pointer-events-auto shadow-[0_4px_20px_rgba(0,59,149,0.1)] backdrop-blur-3xl border border-slate-200 dark:border-[#333333] rounded-full px-4 py-2 bg-white dark:bg-[#111111] flex items-center justify-center gap-3 overflow-hidden transition-all duration-500 ease-out cursor-pointer hover:shadow-md ${
            triggerState === 'idle'
              ? 'w-auto'
              : 'w-full'
          }`}
          onClick={() => {
            if (setActiveTab) setActiveTab('notifications');
          }}
        >
          {triggerState === 'idle' && (
            <>
              <Sparkles className="w-4 h-4 text-[#006CE4]" />
              <span className="text-xs font-bold text-slate-500 dark:text-[#A0A0A0]">Assistant Ready</span>
            </>
          )}

          {triggerState === 'location' && (
            <>
              <div className="w-8 h-8 rounded-full bg-[#006CE4] flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-slate-800 dark:text-[#F0F0F0] font-bold">You're near the Roman Theatre.</p>
                <p className="text-[#006CE4] font-medium mt-0.5">Tap to explore</p>
              </div>
            </>
          )}

          {triggerState === 'time' && (
            <>
              <div className="w-8 h-8 rounded-full bg-[#FEBB02] flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-4 h-4 text-slate-900 dark:text-[#F0F0F0]" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-slate-800 dark:text-[#F0F0F0] font-bold">Good morning!</p>
                <p className="text-slate-500 dark:text-[#A0A0A0] font-medium mt-0.5">3 top-rated cafes nearby.</p>
              </div>
            </>
          )}
        
          {triggerState === 'alert' && latestAlert && (
            <>
              <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-slate-800 dark:text-[#F0F0F0] font-bold">New Alert from {latestAlert.actorName}</p>
                <p className="text-[#E60023] font-medium mt-0.5">{latestAlert.message}</p>
              </div>
            </>
          )}
</motion.div>
      </AnimatePresence>
    </div>
  );
}
