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
      <div className="xl:col-span-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#FFFFFF15] relative h-[50vh] xl:h-auto">
        <MapContainer center={positions[0] || [0, 0]} zoom={4} className="h-full w-full z-0 font-sans" style={{ filter: 'grayscale(0.5) contrast(1.2)' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {roadmap.data.map((item, idx) => {
            const { lat, lng } = getCoords(item.place);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
            <Marker key={item.place.place_id} position={[lat, lng]}>
              <Popup className="cinematic-popup">
                <div className="bg-[#161B22] p-3 text-center border border-[#FFFFFF15] rounded-xl">
                  <h4 className="font-bold text-[#E2E8F0] tracking-tight">{item.place.name}</h4>
                  <p className="text-xs text-[#D4AF37] mt-1 font-medium tracking-wide uppercase">{item.place.category}</p>
                </div>
              </Popup>
            </Marker>
            );
          })}
          <Polyline positions={positions} color="#D4AF37" weight={4} dashArray="8, 12" className="animate-pulse" />
        </MapContainer>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent pointer-events-none" />
        
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-[#161B22]/80 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg border border-[#FFFFFF15]">
            <Navigation className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm uppercase tracking-wider text-[#E2E8F0]">Quest Route</span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto pr-4 space-y-6 custom-scrollbar pb-12 xl:pb-0 relative">
        {/* Timeline Path Line */}
        <div className="absolute left-6 top-24 bottom-0 w-px bg-gradient-to-b from-[#D4AF37] to-transparent pointer-events-none" />

        <div className="flex items-center justify-between mb-8 pl-4">
          <h3 className="text-3xl font-display font-bold text-[#E2E8F0]">Active Log</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#161B22] border border-[#FFFFFF15] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{roadmap.data.length} Missions</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative ml-6">
          {refreshing && (
             <div className="absolute inset-0 bg-[#0D1117]/50 backdrop-blur-md z-10 flex justify-center py-10 rounded-3xl">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
             </div>
          )}
          {roadmap.data.map((item, idx) => (
            <motion.div
              key={item.place.place_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#161B22] p-6 rounded-3xl border border-[#FFFFFF15] relative group hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all ml-6"
            >
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0D1117] border-2 border-[#D4AF37] text-[#D4AF37] font-bold flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0 z-10">
                {idx + 1}
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-[#E2E8F0] text-xl tracking-tight">{item.place.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                      {item.place.category}
                    </span>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      {item.place.location.city}, {item.place.location.country}
                    </p>
                  </div>
                </div>
              </div>

              {item.next_destination && (
                <div className="mt-6 pt-4 border-t border-[#FFFFFF15] flex items-center gap-3 text-zinc-500">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                  <div className="flex-1 h-px bg-[#FFFFFF15]" />
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Next Mission
                    <ChevronRight className="w-4 h-4 text-[#FF4B4B]" />
                    <span className="text-[#E2E8F0] tracking-wider">{item.next_destination}</span>
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
