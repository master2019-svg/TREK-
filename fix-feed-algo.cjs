const fs = require('fs');
let content = fs.readFileSync('src/components/Feed.tsx', 'utf8');

content = content.replace(
  "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, getDoc }",
  "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, getDoc, getDocs, where }"
);

const hookReplacement = `  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'city'>('forYou');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('');`;

content = content.replace("  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'city'>('forYou');\n  const [followingIds, setFollowingIds] = useState<string[]>([]);\n  const [cityFilter, setCityFilter] = useState('');", hookReplacement);

const userFetchReplacement = `  useEffect(() => {
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
  }, [user]);`;

content = content.replace(/  useEffect\(\(\) => \{\n    if \(\!user\) return;\n    const fetchUser = async \(\) => \{\n      const uDoc = await getDoc\(doc\(db, "users", user\.uid\)\);\n      if \(uDoc\.exists\(\)\) \{\n        setFollowingIds\(uDoc\.data\(\)\.following \|\| \[\]\);\n      \}\n    \};\n    fetchUser\(\);\n  \}, \[user\]\);/, userFetchReplacement);

const sortReplacement = `    if (feedTab === 'forYou') {
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
    }`;

content = content.replace(/    if \(feedTab === 'forYou'\) \{\n      \/\/ Twitter-like logic: Score = likes \* 2 \+ comments \* 1 - age \(hours\)\n      const aAge = a\.createdAt \? \(Date\.now\(\) - a\.createdAt\.toDate\(\)\.getTime\(\)\) \/ 3600000 : 0;\n      const bAge = b\.createdAt \? \(Date\.now\(\) - b\.createdAt\.toDate\(\)\.getTime\(\)\) \/ 3600000 : 0;\n      const aScore = \(a\.likes\?\.length \|\| 0\) \* 2 \+ \(a\.comments\?\.length \|\| 0\) - aAge;\n      const bScore = \(b\.likes\?\.length \|\| 0\) \* 2 \+ \(b\.comments\?\.length \|\| 0\) - bAge;\n      return bScore - aScore;\n    \}/, sortReplacement);

fs.writeFileSync('src/components/Feed.tsx', content);
