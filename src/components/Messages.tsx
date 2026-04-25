import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Search as SearchIcon, Phone, Video, Info, Send } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: any;
}

export default function Messages() {
  const [user] = useAuthState(auth);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const dummyChatId = "global_channel";

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;
    
    try {
      await addDoc(collection(db, "messages"), {
        text: messageText.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        userPhoto: user.photoURL,
        createdAt: serverTimestamp()
      });
      setMessageText('');
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#333333] overflow-hidden shadow-sm text-slate-800 dark:text-[#F0F0F0]">
      {/* Sidebar List */}
      <div className="w-full md:w-96 border-r border-slate-200 dark:border-[#333333] hidden md:flex flex-col bg-slate-50 dark:bg-[#1f1f1f]">
        <div className="p-6 border-b border-slate-200 dark:border-[#333333]">
          <h2 className="text-2xl font-black text-[#E60023] mb-4">Comms Hub</h2>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#767676]" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-[#F0F0F0] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#006CE4]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-slate-200 dark:border-[#333333] bg-white dark:bg-[#111111] border-l-4 border-l-[#006CE4]">
            <div className="w-12 h-12 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold">
              GB
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm tracking-wide font-bold text-slate-900 dark:text-[#F0F0F0]">Global Board</h4>
              </div>
              <p className="text-xs truncate font-bold text-[#006CE4]">
                Join the conversation
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBB02]" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111111] relative">
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-[#767676]">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium tracking-wide">Sign in to join the conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-[#333333] bg-white dark:bg-[#111111] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold">GB</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[#F0F0F0] tracking-wide">Global Board</h3>
                  <p className="text-xs text-emerald-600 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400 dark:text-[#767676]">
                <button className="hover:text-[#006CE4] transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="hover:text-[#006CE4] transition-colors"><Video className="w-5 h-5" /></button>
                <button className="hover:text-[#006CE4] transition-colors"><Info className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-[#1f1f1f]">
              {messages.map((msg, i) => {
                const isMe = msg.userId === user?.uid;
                return (
                  <div key={msg.id} className={`flex w-full mt-2 space-x-3 max-w-md ${isMe ? 'ml-auto justify-end' : ''}`}>
                    {!isMe && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                        {msg.userPhoto ? (
                          <img src={msg.userPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500 dark:text-[#A0A0A0]">{msg.userName[0]}</span>
                        )}
                      </div>
                    )}
                    <div>
                      {!isMe && <span className="text-[10px] text-slate-500 dark:text-[#A0A0A0] ml-1 block mb-1">{msg.userName}</span>}
                      <div className={`p-3 shadow-sm border ${
                        isMe 
                          ? 'bg-[#E60023] text-white rounded-l-2xl rounded-tr-2xl border-[#E60023]' 
                          : 'bg-white dark:bg-[#111111] text-slate-900 dark:text-[#F0F0F0] rounded-r-2xl rounded-bl-2xl border-slate-200 dark:border-[#333333]'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-[#333333] bg-white dark:bg-[#111111]">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-[#F0F0F0] rounded-full py-3 px-5 focus:outline-none focus:border-[#006CE4]"
                />
                <button 
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-12 h-12 rounded-full bg-[#E60023] flex items-center justify-center text-white shrink-0 hover:bg-[#E60023] transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5 -ml-1" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
