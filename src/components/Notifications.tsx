import React from 'react';
import { Heart, UserPlus, MapPin, Award } from 'lucide-react';

interface NotificationsProps {
  setActiveTab: (tab: string) => void;
}

export default function Notifications({ setActiveTab }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'Elena G.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      action: 'liked your intel log on',
      target: 'The Roman Theatre',
      time: '2h',
      read: false,
      tab: 'discover'
    },
    {
      id: 2,
      type: 'follow',
      user: 'Marcus Rivera',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      action: 'joined your squad',
      target: '',
      time: '4h',
      read: false,
      tab: 'friends'
    },
    {
      id: 3,
      type: 'achievement',
      user: 'System',
      avatar: 'system',
      action: 'unlocked badge:',
      target: 'Night Owl Explorer',
      time: '1d',
      read: true,
      tab: 'profile'
    },
    {
      id: 4,
      type: 'mention',
      user: 'Sofia Lin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      action: 'mentioned you in a log at',
      target: 'Pyramids of Giza',
      time: '2d',
      read: true,
      tab: 'discover'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-[#E60023] fill-current" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-[#E60023]" />;
      case 'achievement': return <Award className="w-4 h-4 text-[#E60023]" />;
      case 'mention': return <MapPin className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-display font-bold text-[#E2E8F0]">Alerts</h2>
        <span className="bg-[#D4AF37]/10 text-[#E60023] px-3 py-1 rounded-full text-sm font-bold border border-[#D4AF37]/30">
          2 New
        </span>
      </div>

      <div className="bg-[#F0F0F0] dark:bg-[#1f1f1f] border border-[#E9E9E9] dark:border-[#333333] rounded-[2rem] overflow-hidden">
        {notifications.map((notif, idx) => (
          <div 
            key={notif.id} 
            onClick={() => setActiveTab(notif.tab)}
            className={`p-6 flex items-start gap-4 transition-colors cursor-pointer border-b border-[#E9E9E9] dark:border-[#333333] last:border-0 ${notif.read ? 'hover:bg-[#E9E9E9] dark:hover:bg-[#333333]' : 'bg-[#E60023]/10 hover:bg-[#E60023]/20'}`}
          >
            <div className="relative">
              {notif.avatar === 'system' ? (
                <div className="w-12 h-12 rounded-full bg-[#F0F0F0] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <Award className="w-6 h-6 text-[#E60023]" />
                </div>
              ) : (
                <img src={notif.avatar} alt={notif.user} className="w-12 h-12 rounded-full object-cover border border-[#FFFFFF15]" />
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#161B22] rounded-full flex items-center justify-center shadow-lg border border-[#FFFFFF15]">
                {getIcon(notif.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-[#E2E8F0] tracking-wide">{notif.user}</span>{' '}
                {notif.action}{' '}
                {notif.target && <span className="font-bold text-[#E60023]">{notif.target}</span>}
              </p>
              <p className="text-xs text-[#767676] font-mono mt-2">{notif.time}</p>
            </div>

            {!notif.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)] mt-2 shrink-0 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
