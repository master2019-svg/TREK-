const fs = require('fs');
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Replacements
content = content.replace(/bg-emerald-500/g, 'bg-[#E60023]');
content = content.replace(/border-emerald-400/g, 'border-[#E60023]');
content = content.replace(/shadow-\[0_0_10px_rgba\(16,185,129,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/text-emerald-400/g, 'text-[#E60023]');
content = content.replace(/text-\[#0fb5e8\]/g, 'text-[#E60023]');
content = content.replace(/border-\[#0fb5e8\]\/50/g, 'border-[#E60023]');
content = content.replace(/bg-\[#0fb5e8\]\/20/g, 'bg-[#E60023] text-white');
content = content.replace(/text-indigo-400/g, 'text-[#E60023]');

fs.writeFileSync('src/components/Profile.tsx', content);
