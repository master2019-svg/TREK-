const fs = require('fs');
let content = fs.readFileSync('src/components/PlaceCard.tsx', 'utf8');

// Replacements
content = content.replace(/border-slate-200/g, 'border-[#E9E9E9]');
content = content.replace(/bg-slate-50/g, 'bg-[#f0f0f0]');
content = content.replace(/border-slate-100/g, 'border-[#E9E9E9]');
content = content.replace(/text-slate-600/g, 'text-[#767676]');
content = content.replace(/text-slate-700/g, 'text-[#111111]');
content = content.replace(/text-slate-900/g, 'text-[#111111]');
content = content.replace(/bg-\[#003B95\]/g, 'bg-[#E60023]');
content = content.replace(/text-\[#003B95\]/g, 'text-[#E60023]');
content = content.replace(/text-\[#006CE4\]/g, 'text-[#111111]');
content = content.replace(/decoration-\[#006CE4\]\/30/g, 'text-[#111111]');
content = content.replace(/border-\[#0f8a37\]\/20/g, 'border-[#E9E9E9]');
content = content.replace(/text-\[#0f8a37\]/g, 'text-[#767676]');
content = content.replace(/bg-\[#0f8a37\]\/10/g, 'bg-[#f0f0f0]');
content = content.replace(/bg-\[#FF4B4B\]/g, 'bg-[#E60023]');

fs.writeFileSync('src/components/PlaceCard.tsx', content);
