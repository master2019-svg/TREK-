const fs = require('fs');

let content = fs.readFileSync('src/components/Messages.tsx', 'utf8');

const importReplacement = `import { MessageCircle, Search as SearchIcon, Phone, Video, Info, Send, X, UserPlus } from 'lucide-react';`;
content = content.replace("import { MessageCircle, Search as SearchIcon, Phone, Video, Info, Send } from 'lucide-react';", importReplacement);

const stateReplacement = `
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(\`/api/users/search?query=\${searchQuery}\`);
        const data = await res.json();
        setSearchResults(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNewChat = () => {
    setShowNewChat(true);
  };

  const startChatWithUser = (selectedUser: any) => {
    const friendName = selectedUser.displayName || selectedUser.nickname || 'Traveler';
    const newId = 'chat_' + selectedUser.uid;
    const existingChat = chats.find(c => c.id === newId);
    
    if (!existingChat) {
      setChats([{
        id: newId,
        name: friendName,
        desc: 'Start chatting...',
        avatar: friendName[0].toUpperCase(),
        unread: false,
      }, ...chats]);
    }
    setActiveChat(newId);
    setShowNewChat(false);
    setSearchQuery('');
  };
`;

content = content.replace(`  const handleNewChat = () => {
    const friendName = prompt("Enter the name of the traveler you want to chat with:");
    if (!friendName) return;
    const newId = 'chat_' + Date.now();
    setChats([{
      id: newId,
      name: friendName,
      desc: 'Start chatting...',
      avatar: friendName[0].toUpperCase(),
      unread: false,
    }, ...chats]);
    setActiveChat(newId);
  };`, stateReplacement);

const modalContent = `
      {showNewChat && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#111111] p-6 rounded-3xl w-full max-w-sm border border-[#E9E9E9] dark:border-[#333333] shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#111111] dark:text-[#F0F0F0]">New Message</h3>
              <button onClick={() => setShowNewChat(false)} className="text-zinc-500 hover:text-[#111111] dark:hover:text-[#F0F0F0]">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search people..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#f4f4f5] dark:bg-[#222222] text-[#111111] dark:text-[#F0F0F0] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="text-center text-zinc-500 py-4">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => startChatWithUser(u)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#f4f4f5] dark:hover:bg-[#222222] rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : (u.displayName?.[0] || u.nickname?.[0] || 'U')}
                    </div>
                    <div>
                      <p className="font-bold text-[#111111] dark:text-[#F0F0F0]">{u.displayName || u.nickname}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </button>
                ))
              ) : searchQuery ? (
                <div className="text-center text-zinc-500 py-4">No travelers found.</div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
`;

content = content.replace(/(<div className="bg-white dark:bg-\[#111111\] p-4 border-b border-\[#E9E9E9\] dark:border-\[#333333\] flex items-center justify-between">)/, modalContent + '$1');

fs.writeFileSync('src/components/Messages.tsx', content);
