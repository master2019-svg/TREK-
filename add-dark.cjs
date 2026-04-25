const fs = require('fs');

const replaceDark = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Backgrounds
  content = content.replace(/bg-white(?!\s*dark:bg-)/g, 'bg-white dark:bg-[#111111]');
  content = content.replace(/bg-\[#f0f0f0\](?!\s*dark:bg-)/g, 'bg-[#f0f0f0] dark:bg-[#1f1f1f]');
  content = content.replace(/bg-\[#E9E9E9\](?!\s*dark:bg-)/g, 'bg-[#E9E9E9] dark:bg-[#333333]');
  content = content.replace(/bg-slate-50(?!\s*dark:bg-)/g, 'bg-slate-50 dark:bg-[#1f1f1f]');
  content = content.replace(/bg-slate-100(?!\s*dark:bg-)/g, 'bg-slate-100 dark:bg-[#333333]');
  
  // Text
  content = content.replace(/text-\[#111111\](?!\s*dark:text-)/g, 'text-[#111111] dark:text-[#F0F0F0]');
  content = content.replace(/text-\[#767676\](?!\s*dark:text-)/g, 'text-[#767676] dark:text-[#A0A0A0]');
  content = content.replace(/text-slate-800(?!\s*dark:text-)/g, 'text-slate-800 dark:text-[#F0F0F0]');
  content = content.replace(/text-slate-900(?!\s*dark:text-)/g, 'text-slate-900 dark:text-[#F0F0F0]');
  content = content.replace(/text-slate-500(?!\s*dark:text-)/g, 'text-slate-500 dark:text-[#A0A0A0]');
  content = content.replace(/text-slate-400(?!\s*dark:text-)/g, 'text-slate-400 dark:text-[#767676]');
  
  // Borders
  content = content.replace(/border-\[#E9E9E9\](?!\s*dark:border-)/g, 'border-[#E9E9E9] dark:border-[#333333]');
  content = content.replace(/border-slate-200(?!\s*dark:border-)/g, 'border-slate-200 dark:border-[#333333]');
  content = content.replace(/border-slate-100(?!\s*dark:border-)/g, 'border-slate-100 dark:border-[#333333]');

  fs.writeFileSync(file, content);
};

const files = [
  'src/App.tsx',
  'src/components/Sidebar.tsx',
  'src/components/Search.tsx',
  'src/components/Messages.tsx',
  'src/components/Discover.tsx',
  'src/components/PlaceCard.tsx',
  'src/components/PlaceDetailsModal.tsx',
  'src/components/Profile.tsx',
  'src/components/AIIsland.tsx'
];
files.forEach(replaceDark);
