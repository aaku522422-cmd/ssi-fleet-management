'use client';

import React from 'react';
import { Trip, LocationItem } from '@/lib/types';
import { MapPin, ArrowRight, Layers, Truck, Compass, CheckCircle2 } from 'lucide-react';

interface MaterialMatrixProps {
  trips: Trip[];
  locations: LocationItem[];
}

export const MaterialMatrix: React.FC<MaterialMatrixProps> = ({ trips, locations }) => {
  // 1. Group by Source Location (Raw Materials Picked Up)
  const sourceTotals = trips.reduce((acc, t) => {
    const srcName = t.source_name || locations.find(l => l.id === t.source_id)?.name || 'Quarry Source';
    if (!acc[srcName]) {
      acc[srcName] = { name: srcName, tonnage: 0, trips: 0, materials: new Set<string>() };
    }
    acc[srcName].tonnage += Number(t.quantity || 0);
    acc[srcName].trips += 1;
    if (t.material) acc[srcName].materials.add(t.material);
    return acc;
  }, {} as Record<string, { name: string; tonnage: number; trips: number; materials: Set<string> }>);

  // 2. Group by Destination Location (Raw Materials Delivered)
  const destTotals = trips.reduce((acc, t) => {
    const dstName = t.dest_name || locations.find(l => l.id === t.dest_id)?.name || 'Destination Site';
    if (!acc[dstName]) {
      acc[dstName] = { name: dstName, tonnage: 0, trips: 0, materials: new Set<string>() };
    }
    acc[dstName].tonnage += Number(t.quantity || 0);
    acc[dstName].trips += 1;
    if (t.material) acc[dstName].materials.add(t.material);
    return acc;
  }, {} as Record<string, { name: string; tonnage: number; trips: number; materials: Set<string> }>);

  // 3. Group by Specific Route (Source -> Destination Route Matrix)
  const routeMatrix = trips.reduce((acc, t) => {
    const srcName = t.source_name || locations.find(l => l.id === t.source_id)?.name || 'Source Quarry';
    const dstName = t.dest_name || locations.find(l => l.id === t.dest_id)?.name || 'Destination Site';
    const routeKey = `${srcName} ➔ ${dstName}`;

    if (!acc[routeKey]) {
      acc[routeKey] = {
        source: srcName,
        dest: dstName,
        tonnage: 0,
        trips: 0,
        materials: new Set<string>()
      };
    }
    acc[routeKey].tonnage += Number(t.quantity || 0);
    acc[routeKey].trips += 1;
    if (t.material) acc[routeKey].materials.add(t.material);
    return acc;
  }, {} as Record<string, { source: string; dest: string; tonnage: number; trips: number; materials: Set<string> }>);

  const routeList = Object.values(routeMatrix);

  return (
    <div className="space-y-4">
      
      {/* 1. Source Picked Up & Destination Delivered Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Source Quarries Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Picked Up at Source Quarries</span>
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {Object.keys(sourceTotals).length} Sources
            </span>
          </div>

          <div className="space-y-2">
            {Object.values(sourceTotals).length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No trips logged yet</p>
            ) : (
              Object.values(sourceTotals).map((s) => (
                <div key={s.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {Array.from(s.materials).join(', ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-600 block">{s.tonnage.toFixed(1)} Tons</span>
                    <span className="text-[10px] text-slate-500 font-medium">{s.trips} Truck Trips</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Destination Sites Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Delivered to Destination Sites</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              {Object.keys(destTotals).length} Destinations
            </span>
          </div>

          <div className="space-y-2">
            {Object.values(destTotals).length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No trips logged yet</p>
            ) : (
              Object.values(destTotals).map((d) => (
                <div key={d.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {Array.from(d.materials).join(', ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">{d.tonnage.toFixed(1)} Tons</span>
                    <span className="text-[10px] text-slate-500 font-medium">{d.trips} Deliveries</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 2. Source -> Destination Route Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Source ➔ Destination Route Movement Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">Tonnage dispatched per truck route</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Source Quarry / Plant</th>
                <th className="px-4 py-3">Destination Site</th>
                <th className="px-4 py-3">Material Type(s)</th>
                <th className="px-4 py-3 text-center">Truck Trips</th>
                <th className="px-4 py-3 text-right">Total Tonnage Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {routeList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-400">No route movements logged yet</td>
                </tr>
              ) : (
                routeList.map((route, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{route.source}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{route.dest}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{Array.from(route.materials).join(', ')}</td>
                    <td className="px-4 py-3 text-center font-bold font-mono text-slate-700">{route.trips}</td>
                    <td className="px-4 py-3 text-right font-bold font-mono text-blue-600 text-sm">
                      {route.tonnage.toFixed(1)} Tons
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
