const fs = require('fs');

let content = fs.readFileSync('src/components/Feed.tsx', 'utf8');

// Replace standard imports to include extra icons/hooks
content = content.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
content = content.replace("import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Send, MoreHorizontal } from 'lucide-react';", "import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Send, MoreHorizontal, Settings2, MapPin } from 'lucide-react';\nimport { doc, getDoc } from 'firebase/firestore';");

// Replace component definition to add new states and tabs
const stateReplacement = `
  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'city'>('forYou');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      const uDoc = await getDoc(doc(db, "users", user.uid));
      if (uDoc.exists()) {
        setFollowingIds(uDoc.data().following || []);
      }
    };
    fetchUser();
  }, [user]);

  // Compute feed logic
  const displayedPosts = posts.filter(post => {
    if (feedTab === 'following') {
      return followingIds.includes(post.user_id) || post.user_id === user?.uid;
    }
    if (feedTab === 'city' && cityFilter) {
      return post.city?.toLowerCase().includes(cityFilter.toLowerCase());
    }
    return true; // forYou
  }).sort((a, b) => {
    if (feedTab === 'forYou') {
      // Twitter-like logic: Score = likes * 2 + comments * 1 - age (hours)
      const aAge = a.createdAt ? (Date.now() - a.createdAt.toDate().getTime()) / 3600000 : 0;
      const bAge = b.createdAt ? (Date.now() - b.createdAt.toDate().getTime()) / 3600000 : 0;
      const aScore = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) - aAge;
      const bScore = (b.likes?.length || 0) * 2 + (b.comments?.length || 0) - bAge;
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
`;
content = content.replace(/  const \[isPosting, setIsPosting\] = useState<boolean>.*?;|  const \[isPosting, setIsPosting\] = useState\(false\);/, "  const [isPosting, setIsPosting] = useState(false);" + stateReplacement);


// Header & Tabs replacement
const headerReplacement = `
      <div className="flex flex-col gap-4 sticky top-[72px] md:top-0 bg-[#FAFAFA] dark:bg-[#0D1117] z-10 pt-4 pb-2 border-b border-[#E9E9E9] dark:border-[#333333]">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">Home Feed</h2>
          <Settings2 className="w-5 h-5 text-zinc-500" />
        </div>
        
        <div className="flex border-b border-[#E9E9E9] dark:border-[#333333]">
          <button 
            onClick={() => setFeedTab('forYou')}
            className={\`flex-1 pb-3 text-sm font-bold transition-all relative \${feedTab === 'forYou' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}\`}
          >
            For you
            {feedTab === 'forYou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#E60023] rounded-t-full" />}
          </button>
          <button 
            onClick={() => setFeedTab('following')}
            className={\`flex-1 pb-3 text-sm font-bold transition-all relative \${feedTab === 'following' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}\`}
          >
            Following
            {feedTab === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#E60023] rounded-t-full" />}
          </button>
          <button 
            onClick={() => setFeedTab('city')}
            className={\`flex-1 pb-3 text-sm font-bold transition-all relative \${feedTab === 'city' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#111111]'}\`}
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
      </div>`;

content = content.replace(/      <div className="text-center space-y-2 mb-8">[\s\S]*?<\/div>/, headerReplacement);

// Add city to post creation
content = content.replace(`        user_photo: user.photoURL,
        text: newPostText.trim(),`, `        user_photo: user.photoURL,
        text: newPostText.trim(),
        city: cityFilter || '',`);

// Map posts -> displayedPosts
content = content.replace(/\{posts\.map\(post => \(/g, "{displayedPosts.map(post => (");

// Add comments section
const commentSection = `
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
`;

content = content.replace(/(              \{post\.likes && post\.likes\.length > 0 && \([\s\S]*?<\/span>[\s\S]*?\)\}[\s\S]*?<\/div>)([\s\S]*?<\/motion\.div>)/g, function(match, p1, p2) {
  return p1 + '\\n' + commentSection + '\\n' + p2;
});

// Update the message circle to toggle comments
content = content.replace(/<button className="flex items-center gap-1\.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">\s*<MessageCircle className="w-6 h-6" \/>\s*<\/button>/g, `<button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  {post.comments?.length > 0 && <span className="text-sm">{post.comments.length}</span>}
                </button>`);

// Fix the interface
content = content.replace(/  comments: any\[\];/g, "  comments: any[];\n  city?: string;");

fs.writeFileSync('fix-feed-v2-replace.cjs', content);
