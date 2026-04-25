const fs = require('fs');
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Replacements
content = content.replace(/bg-\[#161B22\]\/80/g, 'bg-white');
content = content.replace(/backdrop-blur-xl border border-\[#FFFFFF15\]/g, 'border border-[#E9E9E9]');
content = content.replace(/bg-gradient-to-br from-\[#161B22\] to-transparent/g, 'bg-gradient-to-br from-white to-[#f9f9f9]');
content = content.replace(/text-\[#E2E8F0\]/g, 'text-[#111111]');
content = content.replace(/bg-\[#0D1117\] border border-\[#FFFFFF15\]/g, 'bg-[#E9E9E9] border border-[#E9E9E9]');
content = content.replace(/bg-\[#0D1117\]/g, 'bg-[#E9E9E9]');
content = content.replace(/text-zinc-500 border border-\[#FFFFFF15\]/g, 'text-[#767676] border border-[#E9E9E9]');
content = content.replace(/bg-\[#0D1117\] text-zinc-400 hover:text-\[#E2E8F0\] border border-\[#FFFFFF15\]/g, 'bg-[#F0F0F0] text-[#767676] hover:text-[#111111] border border-[#E9E9E9]');
content = content.replace(/text-zinc-500/g, 'text-[#767676]');
content = content.replace(/text-zinc-400/g, 'text-[#111111]');
content = content.replace(/text-\[#D4AF37\]/g, 'text-[#E60023]');
content = content.replace(/bg-\[#D4AF37\]/g, 'bg-[#E60023]');
content = content.replace(/border-t-\[#D4AF37\]/g, 'border-t-[#E60023]');
content = content.replace(/border-\[#FFFFFF15\]/g, 'border-[#E9E9E9]');
content = content.replace(/text-\[#FF4B4B\]/g, 'text-[#E60023]');
content = content.replace(/border-t-\[#FF4B4B\]/g, 'border-t-[#E60023]');
content = content.replace(/text-\[#0fb5e8\]/g, 'text-[#E60023]');
content = content.replace(/border-t-\[#0fb5e8\]/g, 'border-t-[#E60023]');
content = content.replace(/bg-\[#161B22\]/g, 'bg-white');
content = content.replace(/text-[#0D1117]/g, 'text-white');

fs.writeFileSync('src/components/Profile.tsx', content);
