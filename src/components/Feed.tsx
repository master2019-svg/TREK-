import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Send, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_photo: string;
  text: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  likes: string[];
  comments: any[];
  createdAt: any;
}

export default function Feed() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPostText.trim() && !mediaUrl)) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        user_id: user.uid,
        user_name: user.displayName || 'Traveler',
        user_photo: user.photoURL,
        text: newPostText.trim(),
        media_url: mediaUrl,
        media_type: mediaUrl ? mediaType : null,
        likes: [],
        comments: [],
        createdAt: serverTimestamp()
      });
      setNewPostText('');
      setMediaUrl('');
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (postId: string, currentLikes: string[]) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    if (currentLikes.includes(user.uid)) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-white">
          Community <span className="text-gradient">Feed</span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">Share your latest adventures and media with the squad.</p>
      </div>

      {user && (
        <form onSubmit={handlePost} className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-[#E9E9E9] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#E9E9E9] dark:bg-[#333333]">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex justify-center items-center font-bold text-[#E60023]">{user.displayName?.[0] || 'U'}</div>
              )}
            </div>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg text-zinc-900 dark:text-white placeholder-zinc-400 resize-none pt-2"
              placeholder="What's happening?"
              rows={3}
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
            />
          </div>
          
          {mediaUrl && (
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-black">
              {mediaType === 'image' ? (
                <img src={mediaUrl} alt="Preview" className="w-full max-h-96 object-contain" />
              ) : (
                <video src={mediaUrl} controls className="w-full max-h-96" />
              )}
              <button 
                type="button" 
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[#E9E9E9] dark:border-[#333333]">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const url = prompt("Enter Image URL:");
                  if (url) {
                    setMediaUrl(url);
                    setMediaType('image');
                  }
                }}
                className="p-2 text-zinc-500 hover:text-[#E60023] hover:bg-[#E60023]/10 rounded-full transition-colors"
                title="Add Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => {
                  const url = prompt("Enter Video URL:");
                  if (url) {
                    setMediaUrl(url);
                    setMediaType('video');
                  }
                }}
                className="p-2 text-zinc-500 hover:text-[#E60023] hover:bg-[#E60023]/10 rounded-full transition-colors"
                title="Add Video"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>
            <button 
              type="submit"
              disabled={isPosting || (!newPostText.trim() && !mediaUrl)}
              className="bg-[#E60023] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-[#cc0020] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isPosting ? 'Posting...' : 'Post'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={post.id} 
            className="bg-white dark:bg-[#111111] rounded-3xl border border-[#E9E9E9] dark:border-[#333333] shadow-sm overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E9E9E9] dark:bg-[#333333]">
                  {post.user_photo ? (
                    <img src={post.user_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#E60023]">{post.user_name?.[0] || 'U'}</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">{post.user_name}</h4>
                  <p className="text-xs text-zinc-500">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}</p>
                </div>
              </div>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {post.text && <p className="px-5 pb-3 text-zinc-800 dark:text-zinc-200">{post.text}</p>}

            {post.media_url && (
              <div className="w-full bg-black max-h-[600px] flex items-center justify-center">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="w-full max-h-[600px] object-cover" />
                ) : (
                  <img src={post.media_url} alt="" className="w-full max-h-[600px] object-cover" onDoubleClick={() => toggleLike(post.id, post.likes)} />
                )}
              </div>
            )}

            <div className="p-4 flex items-center justify-between border-t border-[#E9E9E9] dark:border-[#333333]">
              <div className="flex gap-4">
                <button 
                  onClick={() => toggleLike(post.id, post.likes || [])}
                  className={`flex items-center gap-1.5 transition-colors ${post.likes?.includes(user?.uid || '') ? 'text-[#E60023]' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                  <Heart className={`w-6 h-6 ${post.likes?.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                </button>
                <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              {post.likes && post.likes.length > 0 && (
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
