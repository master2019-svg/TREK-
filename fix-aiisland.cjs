const fs = require('fs');

let content = fs.readFileSync('src/components/AIIsland.tsx', 'utf8');

const importReplacement = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Sparkles, Bell } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';`;

content = content.replace(/import React, \{ useState, useEffect \} from 'react';\nimport \{ motion, AnimatePresence \} from 'motion\/react';\nimport \{ MapPin, Clock, Sparkles \} from 'lucide-react';/, importReplacement);

content = content.replace("export default function AIIsland() {", "export default function AIIsland({ setActiveTab }: { setActiveTab?: (t: string) => void }) {");

const hookReplacement = `
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
`;

content = content.replace(/const \[triggerState, setTriggerState\] = useState<'idle' \| 'location' \| 'time'>\('idle'\);\s*useEffect\(\(\) => \{[\s\S]*?return \(\) => \{[\s\S]*?clearTimeout\(timer3\);\s*\};\s*\}, \[\]\);/, hookReplacement);

content = content.replace(`          onClick={() => {
            if (triggerState === 'location') alert('Opening location details...');
            if (triggerState === 'time') alert('Opening nearby cafes...');
          }}`, `          onClick={() => {
            if (setActiveTab) setActiveTab('notifications');
          }}`);

const alertJsx = `
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
`;

content = content.replace(/(<AnimatePresence mode="wait">[\s\S]*?)<\/motion\.div>/, `$1` + alertJsx + `</motion.div>`);

fs.writeFileSync('src/components/AIIsland.tsx', content);
