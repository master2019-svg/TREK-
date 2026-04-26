const fs = require('fs');
let content = fs.readFileSync('src/components/Discover.tsx', 'utf8');

content = content.replace(
  'const [loadingMore, setLoadingMore] = useState(false);',
  'const [loadingMore, setLoadingMore] = useState(false);\n  const [hasMore, setHasMore] = useState(true);'
);

content = content.replace(
  'if (entries[0].isIntersecting && !loading && !loadingMore && !refreshing && places.length > 0) {',
  'if (entries[0].isIntersecting && !loading && !loadingMore && !refreshing && places.length > 0 && hasMore) {'
);

const targetBlock = /const newPlaces = recommendationsResult\.data\.map\(\(item: any\) => item\.place\);\s+if \(isLoadMore\) \{\s+setPlaces\(prev => \[\.\.\.prev, \.\.\.newPlaces\]\);\s+\} else \{\s+setPlaces\(newPlaces\);\s+\}/;

const newBlock = `const newPlaces = recommendationsResult.data.map((item: any) => item.place);
        if (isLoadMore) {
          setPlaces(prev => {
            const currentIds = new Set(prev.map(p => p.place_id || p._id));
            const uniqueNew = newPlaces.filter((p: any) => !currentIds.has(p.place_id || p._id));
            if (uniqueNew.length < 5) setHasMore(false);
            return [...prev, ...uniqueNew];
          });
        } else {
          setPlaces(newPlaces);
          setHasMore(true);
        }`;

content = content.replace(targetBlock, newBlock);

fs.writeFileSync('src/components/Discover.tsx', content);
