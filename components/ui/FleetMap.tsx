'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Minus, Navigation, Truck, Compass, Layers } from 'lucide-react';
import { Trip, LocationItem } from '@/lib/types';

interface FleetMapProps {
  trips: Trip[];
  locations: LocationItem[];
}

export const FleetMap: React.FC<FleetMapProps> = ({ trips, locations }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const pins = [
    { id: 'pin-1', name: 'Quarry Site Alpha', type: 'Source Quarry', lat: '12.9716', lng: '77.5946', x: '25%', y: '35%', color: 'bg-amber-500', activeCount: 3 },
    { id: 'pin-2', name: 'Flyover Site C (NH-44)', type: 'Active Drop Site', lat: '12.9820', lng: '77.6045', x: '68%', y: '48%', color: 'bg-emerald-500', activeCount: 5 },
    { id: 'pin-3', name: 'Crusher Plant Beta', type: 'Processing Plant', lat: '12.9650', lng: '77.5890', x: '42%', y: '70%', color: 'bg-sky-500', activeCount: 2 },
    { id: 'pin-4', name: 'Metro Line 2 Depot', type: 'Construction Site', lat: '12.9890', lng: '77.6120', x: '82%', y: '25%', color: 'bg-indigo-500', activeCount: 4 }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden relative">
      
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-none">Live Fleet & Site Map</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">GPS Telematics Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            4 Locations Active
          </span>
        </div>
      </div>

      {/* Styled Map Container */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden select-none">
        
        {/* Map Grid Pattern background */}
        <div 
          className="absolute inset-0 opacity-40 dark:opacity-20 transition-transform duration-300"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, #f8fafc 1px)`,
            backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
            transform: `scale(${zoomLevel})`
          }}
        />

        {/* Vector Road & Route lines */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-300 dark:stroke-slate-800" strokeWidth="2" strokeDasharray="4 4" fill="none">
          <path d="M 120 70 Q 200 120 320 100 T 450 160" />
          <path d="M 200 160 Q 250 80 380 60" />
        </svg>

        {/* Interactive Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            style={{ left: pin.x, top: pin.y }}
            onClick={() => setSelectedPin(pin.name)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
          >
            {/* Pulse Aura */}
            <span className={`absolute -inset-1 rounded-full ${pin.color} opacity-40 animate-ping`} />
            
            {/* Pin Badge */}
            <div className={`relative px-2 py-1 rounded-full ${pin.color} text-slate-950 font-bold text-[10px] shadow-lg flex items-center gap-1 hover:scale-110 transition-transform`}>
              <Truck className="w-3 h-3" />
              <span className="whitespace-nowrap hidden sm:inline">{pin.name.split(' ')[0]}</span>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-20">
              <p className="font-bold">{pin.name}</p>
              <p className="text-slate-400">{pin.type}</p>
              <p className="text-amber-400 font-mono mt-0.5">{pin.lat}, {pin.lng}</p>
            </div>
          </div>
        ))}

        {/* Map Location Badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>Sector 14 Corridor</span>
        </div>

        {/* Map Zoom Controls (+ / -) like the inspiration mockup */}
        <div className="absolute top-2 right-2 flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-slate-700 dark:text-slate-200">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
