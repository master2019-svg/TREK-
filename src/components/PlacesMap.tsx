import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Place } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function PlacesMap({ places, center, zoom = 3 }: PlacesMapProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBudget, setActiveBudget] = useState('All');

  // Filter out places without valid coordinates
  const validPlaces = places.filter(
    p => p.location && typeof p.location.latitude === 'number' && typeof p.location.longitude === 'number'
  );

  const filteredPlaces = validPlaces.filter(p => {
    const matchCategory = activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchBudget = activeBudget === 'All' || p.budget?.toLowerCase() === activeBudget.toLowerCase();
    return matchCategory && matchBudget;
  });

  // Calculate center based on places if not provided
  const mapCenter = center || (filteredPlaces.length > 0 
    ? [filteredPlaces[0].location.latitude, filteredPlaces[0].location.longitude] as [number, number]
    : validPlaces.length > 0 
      ? [validPlaces[0].location.latitude, validPlaces[0].location.longitude] as [number, number]
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
        {filteredPlaces.map((place) => (
          <Marker 
            key={place.place_id} 
            position={[place.location.latitude, place.location.longitude]}
          >
            <Popup className="rounded-2xl overflow-hidden p-0 custom-popup">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-64"
              >
                <div className="h-32 w-full relative">
                  <img 
                    src={place.image_url || `https://source.unsplash.com/800x600/?${encodeURIComponent(place.category || 'travel')}`}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-zinc-900">{place.rating || '4.5'}</span>
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
        ))}
      </MapContainer>
    </div>
  );
}
