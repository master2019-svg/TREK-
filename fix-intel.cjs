const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });
  fs.writeFileSync(file, content);
};

replaceInFile('src/components/Discover.tsx', [['Intel Map', 'Explore Map']]);
replaceInFile('src/components/PlaceDetailsModal.tsx', [['Traveler Intel', 'Reviews'], ['Post Intel', 'Post Review']]);
replaceInFile('src/components/Search.tsx', [['Intel Map', 'Map View'], ['Intel for "', 'Results for "']]);
replaceInFile('src/components/Profile.tsx', [['Intel Tags', 'Travel Tags']]);
