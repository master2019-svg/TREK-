const fs = require('fs');

let content = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const importReplacement = `import React, { useState, useEffect } from 'react';
import { Heart, UserPlus, MapPin, Award } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';`;
content = content.replace(/import React from 'react';\nimport { Heart, UserPlus, MapPin, Award } from 'lucide-react';/, importReplacement);

const bodyReplacement = `
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
    setActiveTab(notif.tab);
  };
`;

content = content.replace("  const notifications = [", bodyReplacement + "\n  const old_notifications = [");

const mapReplacement = `
      <div className="bg-[#F0F0F0] dark:bg-[#1f1f1f] border border-[#E9E9E9] dark:border-[#333333] rounded-[2rem] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No alerts yet.</div>
        ) : notifications.map((notif, idx) => (
          <div 
            key={notif.id} 
            onClick={() => handleNotifClick(notif)}
            className={\`p-6 flex items-start gap-4 transition-colors cursor-pointer border-b border-[#E9E9E9] dark:border-[#333333] last:border-0 \${notif.read ? 'hover:bg-[#E9E9E9] dark:hover:bg-[#333333]' : 'bg-[#E60023]/10 hover:bg-[#E60023]/20'}\`}
          >
            <div className="relative">
              {notif.actorPhoto === 'system' ? (
                <div className="w-12 h-12 rounded-full bg-[#F0F0F0] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <Award className="w-6 h-6 text-[#E60023]" />
                </div>
              ) : notif.actorPhoto ? (
                <img src={notif.actorPhoto} alt="" className="w-12 h-12 rounded-full object-cover border border-[#FFFFFF15]" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold text-xl">
                  {notif.actorName?.[0] || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#161B22] rounded-full flex items-center justify-center shadow-lg border border-[#FFFFFF15]">
                {getIcon(notif.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-[#111111] dark:text-[#E2E8F0] tracking-wide">{notif.actorName}</span>{' '}
                {notif.message}{' '}
                {notif.target && <span className="font-bold text-[#E60023]">{notif.target}</span>}
              </p>
            </div>

            {!notif.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#E60023] shadow-md mt-2 shrink-0 animate-pulse" />
            )}
          </div>
        ))}
      </div>
`;

content = content.replace(/<div className="bg-\[#F0F0F0\] dark:bg-\[#1f1f1f\] border border-\[#E9E9E9\] dark:border-\[#333333\] rounded-\[2rem\] overflow-hidden">[\s\S]*?<\/div>\s*<\/div>/, mapReplacement + "\n    </div>");

content = content.replace(`        <span className="bg-[#D4AF37]/10 text-[#E60023] px-3 py-1 rounded-full text-sm font-bold border border-[#D4AF37]/30">
          2 New
        </span>`, `{notifications.filter(n => !n.read).length > 0 && (
        <span className="bg-[#E60023]/10 text-[#E60023] px-3 py-1 rounded-full text-sm font-bold border border-[#E60023]/30">
          {notifications.filter(n => !n.read).length} New
        </span>)}`);
        
fs.writeFileSync('src/components/Notifications.tsx', content);
