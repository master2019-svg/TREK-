import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Place } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PlaceImage from './PlaceImage';

// Fix for default marker icons in Leaflet
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PlacesMapProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
}

const CATEGORIES = ['All', 'Beach', 'Mountain', 'City', 'Historic', 'Nature', 'Adventure'];
const BUDGETS = ['All', 'Low', 'Medium', 'High', 'Luxury'];

// Helper component to change map view dynamically
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default React.memo(function PlacesMap({ places, center, zoom = 3 }: PlacesMapProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBudget, setActiveBudget] = useState('All');

  // Helper to extract coordinates safely
  const getCoords = (p: Place) => {
    if (!p.location) return { lat: NaN, lng: NaN };
    const lat = Number(p.location.coordinates?.lat || p.location.latitude);
    const lng = Number(p.location.coordinates?.lng || p.location.longitude);
    return { lat, lng };
  };

  // Filter out places without valid coordinates
  const validPlaces = places.filter(p => {
    const { lat, lng } = getCoords(p);
    return !isNaN(lat) && !isNaN(lng);
  });

  const filteredPlaces = validPlaces.filter(p => {
    const pCategory = p.category?.toLowerCase() || '';
    const pTags = p.tags?.map(t => t.toLowerCase()) || [];
    const pBudget = p.budget?.toLowerCase() || '';
    
    // Category Match (checks exact category or if it's in tags)
    const matchCategory = activeCategory === 'All' || 
      pCategory.includes(activeCategory.toLowerCase()) || 
      pTags.some(tag => tag.includes(activeCategory.toLowerCase()));
      
    // Budget Match logic mapping
    const budgetMap: Record<string, string[]> = {
      'low': ['low', 'budget', 'cheap', '$', 'inexpensive'],
      'medium': ['medium', 'moderate', '$$'],
      'high': ['high', 'expensive', '$$$'],
      'luxury': ['luxury', 'splurge', '$$$$']
    };
    
    const targetBudgets = activeBudget !== 'All' ? (budgetMap[activeBudget.toLowerCase()] || [activeBudget.toLowerCase()]) : [];
    const matchBudget = activeBudget === 'All' || targetBudgets.some(b => pBudget.includes(b));
    
    return matchCategory && matchBudget;
  });

  // Calculate center based on places if not provided
  const mapCenter = center || (filteredPlaces.length > 0 
    ? [getCoords(filteredPlaces[0]).lat, getCoords(filteredPlaces[0]).lng] as [number, number]
    : validPlaces.length > 0 
      ? [getCoords(validPlaces[0]).lat, getCoords(validPlaces[0]).lng] as [number, number]
      : [20, 0] as [number, number]);

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900 relative z-0">
      
      {/* Floating Map Filters */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-transform"
        >
          <Filter className="w-4 h-4" /> 
          Map Filters
          {(activeCategory !== 'All' || activeBudget !== 'All') && (
            <span className="w-2 h-2 rounded-full bg-cyan-500 ml-1" />
          )}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-72 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 dark:text-white">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeCategory === c 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Budget</label>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGETS.map(b => (
                    <button
                      key={b}
                      onClick={() => setActiveBudget(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeBudget === b 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              
              {(activeCategory !== 'All' || activeBudget !== 'All') && (
                <button 
                  onClick={() => { setActiveCategory('All'); setActiveBudget('All'); }}
                  className="w-full py-2 mt-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MapContainer center={mapCenter} zoom={zoom} className="h-full w-full">
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {filteredPlaces.map((place) => {
          const { lat, lng } = getCoords(place);
          if (isNaN(lat) || isNaN(lng)) return null;

          const category = (place.category || '').toLowerCase();
          const tags = place.tags?.map(t => t.toLowerCase()) || [];
          
          let color = '#E60023'; // Default Trek red
          let svgPath = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>';
          
          if (category.includes('beach') || tags.includes('beach')) { 
            color = '#0ea5e9'; 
            svgPath = '<path d="M22 12c-4-4-10-4-14 0M2 12c4-4 10-4 14 0" /><path d="M12 2v20" />'; 
          } else if (category.includes('mountain') || tags.includes('mountain')) { 
            color = '#22c55e'; 
            svgPath = '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>'; 
          } else if (category.includes('city') || tags.includes('urban') || tags.includes('city')) { 
            color = '#8b5cf6'; 
            svgPath = '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>'; 
          } else if (category.includes('historic') || tags.includes('historic') || tags.includes('temple')) { 
            color = '#d97706'; 
            svgPath = '<path d="M2 22h20"/><path d="M6 18v-8"/><path d="M10 18v-8"/><path d="M14 18v-8"/><path d="M18 18v-8"/><path d="M3 10V6l9-4 9 4v4H3z"/>'; // Building/Temple
          } else if (category.includes('nature') || tags.includes('nature') || category.includes('park') || tags.includes('park')) { 
            color = '#10b981'; 
            svgPath = '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'; 
          }

          const customIcon = L.divIcon({
            className: 'bg-transparent border-0',
            html: `
              <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
                <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid white;"></div>
                <div style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid ${color};"></div>
              </div>
            `,
            iconSize: [32, 38],
            iconAnchor: [16, 38],
            popupAnchor: [0, -38]
          });

          return (
          <Marker 
            key={place.place_id} 
            position={[lat, lng]}
            icon={customIcon}
          >
            <Popup className="rounded-2xl overflow-hidden p-0 custom-popup">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-64"
              >
                <div className="h-32 w-full relative">
                  <PlaceImage 
                    place={place}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-zinc-900">{place.average_rating || '4.5'}</span>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900">
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight mb-1">{place.name}</h4>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{place.location.city}, {place.location.country}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{place.description}</p>
                </div>
              </motion.div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
});
