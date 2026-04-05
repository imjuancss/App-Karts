import React, { useState } from 'react';
import { MapPin, ChevronDown, Plus } from 'lucide-react';

const MOCK_TRACKS = [
  { id: 1, name: "Circuito Xtreme Karts", location: "Cajicá" },
  { id: 2, name: "Kartódromo XRP", location: "Cajicá" },
  { id: 3, name: "Indoor Karts Bogotá", location: "Bogotá" }
];

const MOCK_TIMES = [
  { posicion: 1, username: "@JuanCaKart", avatarUrl: "https://i.pravatar.cc/150?u=1", bestTime: "00:44.120", gap: "-" },
  { posicion: 2, username: "@PilotoRapido", avatarUrl: "https://i.pravatar.cc/150?u=2", bestTime: "00:44.250", gap: "+0.130" },
  { posicion: 3, username: "@SpeedKing", avatarUrl: "https://i.pravatar.cc/150?u=3", bestTime: "00:44.300", gap: "+0.180" },
  { posicion: 4, username: "@RacerX", avatarUrl: "https://i.pravatar.cc/150?u=4", bestTime: "00:44.500", gap: "+0.380" },
  { posicion: 5, username: "@KartMaster", avatarUrl: "https://i.pravatar.cc/150?u=5", bestTime: "00:44.750", gap: "+0.630" },
  { posicion: 6, username: "@F1Fan", avatarUrl: "https://i.pravatar.cc/150?u=6", bestTime: "00:44.800", gap: "+0.680" },
  { posicion: 7, username: "@TurboBoost", avatarUrl: "https://i.pravatar.cc/150?u=7", bestTime: "00:45.100", gap: "+0.980" },
  { posicion: 8, username: "@Nitro", avatarUrl: "https://i.pravatar.cc/150?u=8", bestTime: "00:45.300", gap: "+1.180" },
  { posicion: 9, username: "@ApexHunter", avatarUrl: "https://i.pravatar.cc/150?u=9", bestTime: "00:45.500", gap: "+1.380" },
  { posicion: 10, username: "@DriftKing", avatarUrl: "https://i.pravatar.cc/150?u=10", bestTime: "00:45.800", gap: "+1.680" }
];

export default function HomeLeaderboard() {
  const [selectedTrackId] = useState(MOCK_TRACKS[0].id);

  const selectedTrack = MOCK_TRACKS.find(t => t.id === selectedTrackId);
  const podium = MOCK_TIMES.slice(0, 3);
  const peloton = MOCK_TIMES.slice(3);

  const [p1, p2, p3] = podium;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white p-4 pb-32 fade-in font-sans">
      
      {/* Header and Selector */}
      <div className="mb-8 md:max-w-4xl md:mx-auto md:w-full">
        <h1 className="text-xl md:text-3xl font-bold mb-4 text-zinc-100">Leaderboard Global</h1>
        <div className="flex items-center justify-between bg-zinc-900 border border-white/5 p-4 rounded-xl cursor-pointer shadow-md hover:bg-zinc-800 transition duration-300">
          <div className="flex items-center gap-3">
            <MapPin size={22} className="text-zinc-400" />
            <span className="font-medium text-lg text-zinc-100">{selectedTrack.name}</span>
          </div>
          <ChevronDown size={20} className="text-zinc-500" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:max-w-4xl md:mx-auto md:w-full">
        
        {/* Podium Top 3 */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-6 mb-10">
          
          {/* 2nd Place */}
          <div className="order-2 md:order-1 flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex flex-col items-center shadow-lg relative">
            <div className="absolute top-0 right-0 bg-zinc-800/80 text-zinc-300 font-medium px-3 py-1 rounded-bl-xl rounded-tr-2xl text-xs tracking-wide">P2</div>
            <img src={p2.avatarUrl} className="w-16 h-16 rounded-full border-2 border-zinc-700 mb-4 shadow-inner" alt={p2.username} />
            <span className="font-medium text-md text-zinc-200">{p2.username}</span>
            <span className="font-mono text-2xl text-zinc-300 mt-2">{p2.bestTime}</span>
            <span className="font-mono text-xs text-zinc-500 mt-1 uppercase tracking-wider">{p2.gap}</span>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 flex-1 bg-zinc-800 border border-white/10 rounded-2xl py-8 px-6 flex flex-col items-center shadow-[0_0_40px_rgba(0,0,0,0.5)] relative scale-100 md:scale-105 z-10 transition-transform">
            <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm shadow-md">P1</div>
            <img src={p1.avatarUrl} className="w-24 h-24 rounded-full border-4 border-zinc-700 mb-4 shadow-lg shadow-black/40" alt={p1.username} />
            <span className="font-semibold text-xl text-zinc-100">{p1.username}</span>
            <span className="font-mono text-4xl text-amber-500 mt-3">{p1.bestTime}</span>
            <span className="font-mono text-sm text-amber-500/60 mt-2 uppercase tracking-wider font-medium">{p1.gap}</span>
          </div>

          {/* 3rd Place */}
          <div className="order-3 flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex flex-col items-center shadow-lg relative">
            <div className="absolute top-0 right-0 bg-zinc-800/80 text-orange-200/70 font-medium px-3 py-1 rounded-bl-xl rounded-tr-2xl text-xs tracking-wide">P3</div>
            <img src={p3.avatarUrl} className="w-16 h-16 rounded-full border-2 border-zinc-700 mb-4 shadow-inner" alt={p3.username} />
            <span className="font-medium text-md text-zinc-200">{p3.username}</span>
            <span className="font-mono text-2xl text-zinc-400 mt-2">{p3.bestTime}</span>
            <span className="font-mono text-xs text-zinc-500 mt-1 uppercase tracking-wider">{p3.gap}</span>
          </div>

        </div>

        {/* Peloton (Positions 4-10) */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          {peloton.map((p, i) => (
            <div key={p.posicion} className={`flex items-center py-4 px-5 hover:bg-zinc-800/50 transition-colors ${i !== peloton.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className={`w-8 text-center text-zinc-500 font-mono text-sm mr-4`}>
                {p.posicion}
              </div>
              <img src={p.avatarUrl} className="w-10 h-10 rounded-full border border-zinc-700/50 shadow-sm mr-4 grayscale-[20%]" alt={p.username} />
              <span className="font-medium text-zinc-200 flex-1">{p.username}</span>
              <div className="flex flex-col items-end justify-center">
                <span className="font-mono text-sm font-semibold text-zinc-200">{p.bestTime}</span>
                <span className="font-mono text-xs text-zinc-500 mt-0.5">{p.gap}</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>

      {/* FAB Button */}
      <button className="fixed bottom-8 right-6 md:right-10 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 px-6 py-4 md:px-8 md:py-4 rounded-full shadow-2xl shadow-amber-500/20 transition-all hover:-translate-y-1 hover:shadow-amber-500/30 flex items-center justify-center z-50">
        <Plus size={22} strokeWidth={2.5} />
        <span className="font-bold text-sm ml-2 hidden sm:inline tracking-wide font-sans">Subir Tiempo</span>
      </button>

    </div>
  );
}
