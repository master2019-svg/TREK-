const fs = require('fs');
let content = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const replacement = `<div className="flex gap-2">
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                          if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                          }
                        } else {
                          if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        setMediaUrl(canvas.toDataURL('image/jpeg', 0.8));
                        setMediaType('image');
                      };
                      img.src = ev.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <button 
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="p-2 text-zinc-500 hover:text-[#E60023] hover:bg-[#E60023]/10 rounded-full transition-colors"
                title="Add Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => {
                  const url = prompt("Enter Video URL (due to constraints videos use URLs):");
                  if (url) {
                    setMediaUrl(url);
                    setMediaType('video');
                  }
                }}
                className="p-2 text-zinc-500 hover:text-[#E60023] hover:bg-[#E60023]/10 rounded-full transition-colors"
                title="Add Video"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>`;

content = content.replace(/<div className="flex gap-2">[\s\S]*?<button \s*type="button"\s*onClick=\{\(\) => \{\s*const url = prompt\("Enter Video URL:"\);\s*if \(url\) \{\s*setMediaUrl\(url\);\s*setMediaType\('video'\);\s*\}\s*\}\}[\s\S]*?<\/button>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/Feed.tsx', content);
