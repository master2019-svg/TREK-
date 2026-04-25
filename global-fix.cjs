const fs = require('fs');

const files = [
  'src/components/Search.tsx',
  'src/components/Messages.tsx',
  'src/components/Notifications.tsx',
  'src/components/PlaceDetailsModal.tsx',
  'src/components/Discover.tsx',
  'src/components/PlaceCard.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/bg-\[#003B95\]/g, 'bg-[#E60023]');
    content = content.replace(/text-\[#003B95\]/g, 'text-[#E60023]');
    content = content.replace(/text-\[#febb02\]/g, 'text-[#E60023]');
    content = content.replace(/border-\[#febb02\]/g, 'border-[#E9E9E9]');
    content = content.replace(/border-\[#003B95\]/g, 'border-[#E60023]');
    content = content.replace(/bg-transparent text-slate-900/g, 'bg-[#f0f0f0] text-[#111111]');
    content = content.replace(/bg-\[#006CE4\]/g, 'bg-[#E60023]');
    content = content.replace(/text-white rounded-full font-bold text-lg hover:bg-\[#003B95\]/g, 'text-white rounded-full font-bold text-lg hover:bg-[#cc0020]');
    content = content.replace(/focus:ring-\[#febb02\]\/30/g, 'focus:ring-[#E60023]/30');
    content = content.replace(/bg-zinc-900/g, 'bg-[#111111]');
    content = content.replace(/glass text-zinc-600/g, 'bg-white text-[#767676] border border-[#E9E9E9]');
    content = content.replace(/bg-\[#161B22\]\/80 backdrop-blur-xl border border-\[#FFFFFF15\]/g, 'bg-[#F0F0F0] border border-[#E9E9E9]');
    content = content.replace(/bg-\[#D4AF37\] text-\[#0D1117\] shadow-\[0_0_15px_rgba\(212,175,55,0\.3\)\]/g, 'bg-white text-[#111111] shadow-sm');
    content = content.replace(/text-zinc-500 hover:text-\[#E2E8F0\]/g, 'text-[#767676] hover:text-[#111111]');
    content = content.replace(/bg-\[#0D1117\]/g, 'bg-[#F0F0F0]');
    content = content.replace(/text-\[#D4AF37\]/g, 'text-[#E60023]');
    content = content.replace(/text-zinc-500/g, 'text-[#767676]');
    content = content.replace(/border-zinc-800\/50/g, 'border-[#E9E9E9]');
    content = content.replace(/bg-zinc-800/g, 'bg-[#E9E9E9]');
    content = content.replace(/bg-zinc-900\/80/g, 'bg-white/80');
    
    fs.writeFileSync(file, content);
  }
});
