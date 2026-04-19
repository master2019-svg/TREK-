import React, { useState, useEffect } from 'react';

export default function PlaceImage({ place, className }: { place: any, className?: string }) {
  const isBadPlaceholder = (url: string) => url?.includes('unsplash.com');
  const getInitialImage = () => {
    const url = place.image || place.image_url;
    return url && !isBadPlaceholder(url) ? url : null;
  };
  const [imageUrl, setImageUrl] = useState<string | null>(getInitialImage());

  useEffect(() => {
    if (getInitialImage()) {
        setImageUrl(getInitialImage());
        return;
    }

    let isMounted = true;
    const fallbackImage = `https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop`;

    async function fetchWikiImage() {
      try {
        // 1. Search for the place
        const query = `${place.name} ${place.location?.city || ''}`;
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const searchData = await searchRes.json();
        
        if (searchData.query?.search?.length > 0) {
          const title = searchData.query.search[0].title;
          
          // 2. Get image for the title
          const imageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}&origin=*`);
          const imageData = await imageRes.json();
          
          const pages = imageData.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const originalImageUrl = pages[pageId]?.original?.source;
            if (originalImageUrl && isMounted) {
              setImageUrl(originalImageUrl);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch wiki image:", error);
      }
      
      // Fallback
      if (isMounted) {
          setImageUrl(fallbackImage);
      }
    }
    
    fetchWikiImage();

    return () => { isMounted = false; }
  }, [place.name, place.location?.city, place.image, place.image_url]);

  return (
    <img 
      src={imageUrl || `https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop`}
      alt={place.name}
      className={className || "w-full h-full object-cover"}
      referrerPolicy="no-referrer"
    />
  );
}
