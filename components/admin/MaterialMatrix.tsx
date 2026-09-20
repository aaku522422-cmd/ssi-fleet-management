'use client';

import React, { useState } from 'react';
import { Trip, LocationItem } from '@/lib/types';
import { MapPin, ArrowRight, Layers, Truck, Compass, CheckCircle2, X, Clock, ExternalLink, Navigation, Camera, Gauge } from 'lucide-react';

interface MaterialMatrixProps {
  trips: Trip[];
  locations: LocationItem[];
}

export const MaterialMatrix: React.FC<MaterialMatrixProps> = ({ trips, locations }) => {
  // Modal Filter State: { type: 'source' | 'dest', name: string }
  const [selectedFilter, setSelectedFilter] = useState<{ type: 'source' | 'dest'; name: string } | null>(null);

  // 1. Group by Source Location
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

  // 2. Group by Destination Location
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

  // 3. Group by Specific Route
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

  // Filtered trips for active drill-down modal
  const modalTrips = selectedFilter
    ? trips.filter(t => {
        if (selectedFilter.type === 'source') {
          return (t.source_name || locations.find(l => l.id === t.source_id)?.name) === selectedFilter.name;
        } else {
          return (t.dest_name || locations.find(l => l.id === t.dest_id)?.name) === selectedFilter.name;
        }
      })
    : [];

  return (
    <div className="space-y-4">
      
      {/* 1. Source Picked Up & Destination Delivered Summary Cards (Interactive & Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Source Quarries Breakdown (Clickable) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Picked Up at Source Quarries</span>
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              Click Quarry to View Truck Logs
            </span>
          </div>

          <div className="space-y-2">
            {Object.values(sourceTotals).length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No trips logged yet</p>
            ) : (
              Object.values(sourceTotals).map((s) => (
                <div
                  key={s.name}
                  onClick={() => setSelectedFilter({ type: 'source', name: s.name })}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-blue-600">
                      <span>{s.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                    </div>
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

        {/* Destination Sites Breakdown (Clickable) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Delivered to Destination Sites</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              Click Site to View Deliveries
            </span>
          </div>

          <div className="space-y-2">
            {Object.values(destTotals).length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No trips logged yet</p>
            ) : (
              Object.values(destTotals).map((d) => (
                <div
                  key={d.name}
                  onClick={() => setSelectedFilter({ type: 'dest', name: d.name })}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-emerald-600">
                      <span>{d.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
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
                    <td 
                      onClick={() => setSelectedFilter({ type: 'source', name: route.source })}
                      className="px-4 py-3 font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    >
                      {route.source}
                    </td>
                    <td 
                      onClick={() => setSelectedFilter({ type: 'dest', name: route.dest })}
                      className="px-4 py-3 font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
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

      {/* 3. DRILL-DOWN MODAL FOR TRUCK LOGS */}
      {selectedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {selectedFilter.type === 'source' ? 'Source Quarry Dispatch Logs' : 'Destination Site Delivery Logs'}
                </span>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  {selectedFilter.type === 'source' ? <Compass className="w-5 h-5 text-amber-400" /> : <MapPin className="w-5 h-5 text-emerald-400" />}
                  <span>{selectedFilter.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFilter(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Truck Trip Logs */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 bg-slate-50">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>{modalTrips.length} Total Truck Log Entries</span>
                <span className="font-mono text-blue-600">
                  Total Material: {modalTrips.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0).toFixed(1)} Tons
                </span>
              </div>

              {modalTrips.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
                  No truck trips found for this location.
                </div>
              ) : (
                modalTrips.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
                    
                    {/* Top Row: Vehicle & Material */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 font-mono text-sm">{t.vehicle_number}</span>
                          <p className="text-[11px] text-slate-500">Driver: <strong>{t.driver_name || 'Driver'}</strong></p>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-auto">
                        <span className="font-extrabold text-blue-600 font-mono text-sm">{t.quantity} {t.unit || 'Tons'}</span>
                        <span className="block text-[11px] font-semibold text-slate-700">{t.material}</span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{t.source_name || 'Source Quarry'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-emerald-700">{t.dest_name || 'Destination Site'}</span>
                      </div>
                      
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'in_transit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Telematics: Odometers */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Start Odo</span>
                        <span className="font-bold text-slate-900">{t.start_odometer || 'N/A'} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">End Odo</span>
                        <span className="font-bold text-slate-900">{t.end_odometer || 'In-Transit'} km</span>
                      </div>
                    </div>

                    {/* Addresses & Photos */}
                    <div className="space-y-1.5 text-[11px]">
                      {t.loading_gps_address && (
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Departure GPS:</strong> {t.loading_gps_address}</span>
                        </div>
                      )}
                      {t.offloading_gps_address && (
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Drop GPS:</strong> {t.offloading_gps_address}</span>
                        </div>
                      )}

                      {/* Photo Previews */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {t.loading_photo_url && (
                          <div className="rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t.loading_photo_url} alt="Loading photo" className="w-full h-24 object-cover" />
                            <span className="block text-[9px] text-center font-semibold bg-slate-100 py-0.5 text-slate-600">Raw Material Fill</span>
                          </div>
                        )}
                        {t.offloading_photo_url && (
                          <div className="rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t.offloading_photo_url} alt="Offloading photo" className="w-full h-24 object-cover" />
                            <span className="block text-[9px] text-center font-semibold bg-slate-100 py-0.5 text-slate-600">Offloaded Drop Area</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedFilter(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
