import React, { useCallback, useEffect, useState } from 'react';
import { Place } from '../types';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2, Calendar, Navigation, Map as MapIcon, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import LoginButton from './LoginButton';

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

export default function Roadmap() {
  const [user, authLoading] = useAuthState(auth);
  const [roadmap, setRoadmap] = useState<{data: {place: Place, next_destination: string | null}[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const response = await fetch(`/api/roadmap/${user.uid}`);
      const result = await response.json();
      if (result.data) {
        setRoadmap(result);
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap, authLoading]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRoadmap();
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-zinc-900 dark:text-white animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Mapping out your adventure...</p>
      </div>
    );
  }

  if (!user || !roadmap || roadmap.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto relative">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-trek-green/20">
          <MapIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-display font-black mb-4 dark:text-white">Your Roadmap Awaits</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          Sign in and set your travel preferences in the Profile tab to generate a custom roadmap with optimized routes and destinations.
        </p>
        {!user ? <LoginButton /> : (
          <button onClick={handleRefresh} className="mt-4 flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-full font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Roadmap
          </button>
        )}
      </div>
    );
  }

  const getCoords = (p: Place) => {
    if (!p.location) return { lat: NaN, lng: NaN };
    const lat = Number(p.location.coordinates?.lat || p.location.latitude);
    const lng = Number(p.location.coordinates?.lng || p.location.longitude);
    return { lat, lng };
  };

  const positions = roadmap.data
    .map(item => item.place)
    .map(p => getCoords(p))
    .filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng))
    .map(loc => [loc.lat, loc.lng] as [number, number]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-auto xl:h-[calc(100vh-12rem)]">
      <div className="xl:col-span-2 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900 relative h-[50vh] xl:h-auto">
        <MapContainer center={positions[0] || [0, 0]} zoom={4} className="h-full w-full z-0">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {roadmap.data.map((item, idx) => {
            const { lat, lng } = getCoords(item.place);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
            <Marker key={item.place.place_id} position={[lat, lng]}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-zinc-900">{item.place.name}</h4>
                  <p className="text-xs text-zinc-500">{item.place.category}</p>
                </div>
              </Popup>
            </Marker>
            );
          })}
          <Polyline positions={positions} color="#18181b" weight={3} dashArray="10, 10" />
        </MapContainer>
        <div className="absolute top-6 left-6 z-10">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
            <Navigation className="w-5 h-5 text-zinc-900 dark:text-white" />
            <span className="font-bold text-sm uppercase tracking-wider dark:text-white">Optimized Route</span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto pr-4 space-y-6 custom-scrollbar pb-12 xl:pb-0">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-display font-bold dark:text-white">Itinerary</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-2 custom-bounce"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{roadmap.data.length} Stops</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 relative">
          {refreshing && (
             <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10 flex justify-center py-10 rounded-3xl">
                <Loader2 className="w-8 h-8 text-trek-green animate-spin" />
             </div>
          )}
          {roadmap.data.map((item, idx) => (
            <motion.div
              key={item.place.place_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 relative group hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg">
                {idx + 1}
              </div>
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{item.place.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-tighter mt-1">
                    {item.place.location.city}, {item.place.location.country}
                  </p>
                </div>
              </div>

              {item.next_destination && (
                <div className="mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
                  <div className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Next stop
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-zinc-600 dark:text-zinc-300">{item.next_destination}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
