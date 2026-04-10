import React, { useState } from 'react';
import { Plus } from 'lucide-react';

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
  const [selectedTrackId, setSelectedTrackId] = useState(MOCK_TRACKS[0].id);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-neutral-200 p-6 pb-32 font-sans">
      
      {/* Header and Native Selector */}
      <div className="mb-12 md:max-w-4xl md:mx-auto md:w-full">
        <h1 className="text-3xl font-bold mb-6 text-zinc-100">Leaderboard Global</h1>
        
        <div className="w-full">
          <select 
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 text-neutral-100 py-3 px-4 rounded-lg outline-none focus:border-neutral-600 transition-colors"
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(Number(e.target.value))}
          >
            {MOCK_TRACKS.map(track => (
              <option key={track.id} value={track.id}>
                {track.name} - {track.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area - Flat Dense List */}
      <div className="flex flex-col md:max-w-4xl md:mx-auto md:w-full">
        <div className="flex flex-col gap-8">
          {MOCK_TIMES.map((p) => (
            <div key={p.posicion} className="flex items-center gap-4 border-b border-neutral-900 pb-4">
              <span className="w-8 text-center text-neutral-500 font-mono text-xl">{p.posicion}</span>
              <img src={p.avatarUrl} className="w-12 h-12 rounded-full" alt={p.username} />
              <span className="font-medium flex-1 text-lg text-neutral-200">{p.username}</span>
              <div className="flex flex-col items-end">
                <span className="font-mono text-xl text-neutral-100">{p.bestTime}</span>
                <span className="font-mono text-sm text-neutral-500">{p.gap}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB Button - Simplified */}
      <button className="fixed bottom-8 right-6 md:right-10 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-100 px-6 py-4 rounded-full flex items-center justify-center transition-colors shadow-lg">
        <Plus size={22} />
        <span className="font-medium text-sm ml-2 hidden sm:inline tracking-wide font-sans">Subir Tiempo</span>
      </button>

    </div>
  );
}
