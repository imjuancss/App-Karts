import React, { useState } from 'react';
import { MapPin, ChevronDown, Plus } from 'lucide-react';

const MOCK_TRACKS = [
  { id: 1, name: "Circuito Xtreme Karts", location: "Cajicá" },
  { id: 2, name: "Kartódromo XRP", location: "Cajicá" },
  { id: 3, name: "Indoor Karts Bogotá", location: "Bogotá" }
];

const MOCK_TIMES = [
  { posicion: 1, username: "@JuanCaKart", avatarUrl: "https://i.pravatar.cc/150?u=1", equipoColor: "bg-red-500", bestTime: "00:44.120", gap: "-" },
  { posicion: 2, username: "@PilotoRapido", avatarUrl: "https://i.pravatar.cc/150?u=2", equipoColor: "bg-blue-500", bestTime: "00:44.250", gap: "+0.130" },
  { posicion: 3, username: "@SpeedKing", avatarUrl: "https://i.pravatar.cc/150?u=3", equipoColor: "bg-green-500", bestTime: "00:44.300", gap: "+0.180" },
  { posicion: 4, username: "@RacerX", avatarUrl: "https://i.pravatar.cc/150?u=4", equipoColor: "bg-yellow-500", bestTime: "00:44.500", gap: "+0.380" },
  { posicion: 5, username: "@KartMaster", avatarUrl: "https://i.pravatar.cc/150?u=5", equipoColor: "bg-purple-500", bestTime: "00:44.750", gap: "+0.630" },
  { posicion: 6, username: "@F1Fan", avatarUrl: "https://i.pravatar.cc/150?u=6", equipoColor: "bg-red-600", bestTime: "00:44.800", gap: "+0.680" },
  { posicion: 7, username: "@TurboBoost", avatarUrl: "https://i.pravatar.cc/150?u=7", equipoColor: "bg-blue-600", bestTime: "00:45.100", gap: "+0.980" },
  { posicion: 8, username: "@Nitro", avatarUrl: "https://i.pravatar.cc/150?u=8", equipoColor: "bg-green-600", bestTime: "00:45.300", gap: "+1.180" },
  { posicion: 9, username: "@ApexHunter", avatarUrl: "https://i.pravatar.cc/150?u=9", equipoColor: "bg-orange-500", bestTime: "00:45.500", gap: "+1.380" },
  { posicion: 10, username: "@DriftKing", avatarUrl: "https://i.pravatar.cc/150?u=10", equipoColor: "bg-purple-600", bestTime: "00:45.800", gap: "+1.680" }
];

export default function HomeLeaderboard() {
  const [selectedTrackId] = useState(MOCK_TRACKS[0].id);

  const selectedTrack = MOCK_TRACKS.find(t => t.id === selectedTrackId);
  const podium = MOCK_TIMES.slice(0, 3);
  const peloton = MOCK_TIMES.slice(3);

  const [p1, p2, p3] = podium;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white p-4 pb-24 fade-in font-sans">
      
      {/* Header and Selector */}
      <div className="mb-6 md:max-w-4xl md:mx-auto md:w-full">
        <h1 className="text-xl md:text-2xl font-bold mb-3">Leaderboard Global</h1>
        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg cursor-pointer shadow-lg hover:bg-slate-700 transition">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-gray-400" />
            <span className="font-medium text-lg">{selectedTrack.name}</span>
          </div>
          <ChevronDown size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:max-w-4xl md:mx-auto md:w-full">
        
        {/* Podium Top 3 */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-4 mb-8">
          
          {/* 2nd Place */}
          <div className="order-2 md:order-1 flex-1 bg-slate-900 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center shadow-lg relative">
            <div className="absolute top-0 right-0 bg-slate-300 text-slate-800 font-bold px-2 py-1 rounded-bl-lg rounded-tr-2xl text-xs">P2</div>
            <img src={p2.avatarUrl} className="w-16 h-16 rounded-full border-2 border-slate-300 mb-3 grayscale-[20%]" alt={p2.username} />
            <span className="font-bold text-md text-slate-200">{p2.username}</span>
            <span className="font-mono text-2xl text-slate-300 mt-2">{p2.bestTime}</span>
            <span className="font-mono text-xs text-slate-500 mt-1 gap-pill">{p2.gap}</span>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 flex-1 bg-slate-900 border border-yellow-500/40 rounded-2xl p-6 flex flex-col items-center shadow-[0_0_30px_rgba(250,204,21,0.1)] relative scale-100 md:scale-105 z-10">
            <div className="absolute top-0 right-0 bg-yellow-400 text-amber-950 font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl text-sm">P1</div>
            <img src={p1.avatarUrl} className="w-20 h-20 rounded-full border-4 border-yellow-400 mb-3" alt={p1.username} />
            <span className="font-bold text-lg text-white">{p1.username}</span>
            <span className="font-mono text-3xl text-yellow-400 mt-2 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">{p1.bestTime}</span>
            <span className="font-mono text-xs text-yellow-400/70 mt-2 uppercase tracking-wider">{p1.gap}</span>
          </div>

          {/* 3rd Place */}
          <div className="order-3 flex-1 bg-slate-900 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center shadow-lg relative">
            <div className="absolute top-0 right-0 bg-amber-700 text-amber-100 font-bold px-2 py-1 rounded-bl-lg rounded-tr-2xl text-xs">P3</div>
            <img src={p3.avatarUrl} className="w-16 h-16 rounded-full border-2 border-amber-700 mb-3 grayscale-[40%]" alt={p3.username} />
            <span className="font-bold text-md text-slate-200">{p3.username}</span>
            <span className="font-mono text-2xl text-amber-600 mt-2">{p3.bestTime}</span>
            <span className="font-mono text-xs text-slate-500 mt-1 gap-pill">{p3.gap}</span>
          </div>

        </div>

        {/* Peloton (Positions 4-10) */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-sm">
          {peloton.map((p, i) => (
            <div key={p.posicion} className={`flex items-center p-4 hover:bg-slate-800/50 transition-colors ${i !== peloton.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
              <div className={`${p.equipoColor} w-8 rounded text-center text-white font-bold text-sm py-1 shadow-inner shadow-black/20 mr-4`}>
                {p.posicion}
              </div>
              <img src={p.avatarUrl} className="w-10 h-10 rounded-full border border-slate-700 shadow-sm mr-4" alt={p.username} />
              <span className="font-medium text-slate-200 flex-1">{p.username}</span>
              <div className="flex flex-col items-end justify-center">
                <span className="font-mono text-sm font-semibold text-slate-100">{p.bestTime}</span>
                <span className="font-mono text-xs text-slate-500">{p.gap}</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>

      {/* FAB Button */}
      <button className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-amber-950 p-4 rounded-full shadow-[0_10px_25px_rgba(250,204,21,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center z-50">
        <Plus size={24} strokeWidth={3} />
      </button>

    </div>
  );
}
