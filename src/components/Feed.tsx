import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, getDoc, getDocs, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Send, MoreHorizontal, Settings2, MapPin } from 'lucide-react';

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
  city?: string;
  createdAt: any;
}

export default function Feed() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPosting, setIsPosting] = useState(false);
  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'city'>('forYou');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        // Fetch Followed Users
        const uDoc = await getDoc(doc(db, "users", user.uid));
        if (uDoc.exists()) {
          setFollowingIds(uDoc.data().following || []);
        }

        // Fetch User Interactions for Personalized Feed (Cities)
        const qInteractions = query(collection(db, "interactions"), where("user_id", "==", user.uid));
        const interactSnap = await getDocs(qInteractions);
        const cities = new Set<string>();
        interactSnap.forEach((d) => {
          const data = d.data();
          if (data.place?.location?.city) {
            cities.add(data.place.location.city.toLowerCase());
          }
        });
        setPreferredCities(Array.from(cities));
      } catch (err) {
        console.error("Failed to fetch feed personalization data:", err);
      }
    };
    fetchUserData();
  }, [user]);

  // Compute feed logic
  const displayedPosts = posts.filter((post) => {
    if (feedTab === 'following') {
      return followingIds.includes(post.user_id) || post.user_id === user?.uid;
    }
    if (feedTab === 'city' && cityFilter) {
      return post.city?.toLowerCase().includes(cityFilter.toLowerCase());
    }
    return true; // forYou
  }).sort((a, b) => {
    if (feedTab === 'forYou') {
      const aAge = a.createdAt ? (Date.now() - a.createdAt.toDate().getTime()) / 3600000 : 0;
      const bAge = b.createdAt ? (Date.now() - b.createdAt.toDate().getTime()) / 3600000 : 0;
      
      let aScore = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) - aAge;
      let bScore = (b.likes?.length || 0) * 2 + (b.comments?.length || 0) - bAge;

      // Personalization Factors
      // Boost posts from followed users
      if (followingIds.includes(a.user_id)) aScore += 10;
      if (followingIds.includes(b.user_id)) bScore += 10;

      // Boost posts in cities the user has interacted with
      if (a.city && preferredCities.includes(a.city.toLowerCase())) aScore += 5;
      if (b.city && preferredCities.includes(b.city.toLowerCase())) bScore += 5;

      return bScore - aScore;
    }
    // Default descending date
    const aTime = a.createdAt ? a.createdAt.toMillis() : Date.now();
    const bTime = b.createdAt ? b.createdAt.toMillis() : Date.now();
    return bTime - aTime;
  });

  const handleComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          user_id: user.uid,
          user_name: user.displayName || 'Traveler',
          text: commentText.trim(),
          createdAt: new Date().toISOString()
        })
      });
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

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
        city: cityFilter || '',
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
      <div className="flex flex-col gap-4 sticky top-[72px] md:top-0 bg-[#FAFAFA] dark:bg-[#0D1117] z-10 pt-4 pb-2 border-b border-[#E9E9E9] dark:border-[#333333]">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">Home Feed</h2>
          <Settings2 className="w-5 h-5 text-zinc-500" />
        </div>
        
        <div className="flex border-b border-[#E9E9E9] dark:border-[#333333]">
          <button 
            onClick={() => setFeedTab('forYou')}
            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${feedTab === 'forYou' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}`}
          >
            For you
            {feedTab === 'forYou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#E60023] rounded-t-full" />}
          </button>
          <button 
            onClick={() => setFeedTab('following')}
            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${feedTab === 'following' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}`}
          >
            Following
            {feedTab === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#E60023] rounded-t-full" />}
          </button>
          <button 
            onClick={() => setFeedTab('city')}
            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${feedTab === 'city' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}`}
          >
            City Intel
            {feedTab === 'city' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#E60023] rounded-t-full" />}
          </button>
        </div>
        
        <AnimatePresence>
          {feedTab === 'city' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter by city (e.g. Kyoto)..."
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  className="w-full bg-[#E9E9E9] dark:bg-[#111111] text-zinc-900 dark:text-white pl-9 pr-4 py-2 rounded-full border-none focus:ring-1 focus:ring-[#E60023] text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                          if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                          }
                        } else {
                          if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        setMediaUrl(canvas.toDataURL('image/jpeg', 0.8));
                        setMediaType('image');
                      };
                      img.src = ev.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <button 
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="p-2 text-zinc-500 hover:text-[#E60023] hover:bg-[#E60023]/10 rounded-full transition-colors"
                title="Add Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => {
                  const url = prompt("Enter Video URL (due to constraints videos use URLs):");
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
        {displayedPosts.map(post => (
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
                <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  {post.comments?.length > 0 && <span className="text-sm">{post.comments.length}</span>}
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

            {activeCommentPost === post.id && (
              <div className="p-4 bg-zinc-50 dark:bg-[#1A1D24] border-t border-[#E9E9E9] dark:border-[#333333]">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#111111] border border-[#E9E9E9] dark:border-[#444444] rounded-full px-4 py-1.5 focus:outline-none focus:border-[#E60023] text-sm text-zinc-900 dark:text-white"
                  />
                  <button 
                    onClick={() => handleComment(post.id)}
                    disabled={!commentText.trim()}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-1.5 rounded-full text-sm font-bold disabled:opacity-50 hover:opacity-80 disabled:hover:opacity-50"
                  >
                    Reply
                  </button>
                </div>
                <div className="space-y-3">
                  {post.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E9E9E9] dark:bg-[#333333] flex items-center justify-center text-xs font-bold text-[#E60023] shrink-0">
                        {comment.user_name?.[0] || 'U'}
                      </div>
                      <div className="bg-white dark:bg-[#111111] p-2.5 px-3 rounded-2xl rounded-tl-none border border-[#E9E9E9] dark:border-[#333333] flex-1 text-sm shadow-sm">
                        <p className="font-bold text-zinc-900 dark:text-white text-xs mb-0.5">{comment.user_name}</p>
                        <p className="text-zinc-800 dark:text-zinc-200">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
