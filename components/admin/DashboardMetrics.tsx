'use client';

import React from 'react';
import { DashboardMetrics as MetricsType, Trip, FuelLog, Expense, Vehicle, LocationItem } from '@/lib/types';
import { MaterialMatrix } from './MaterialMatrix';
import { Truck, Layers, Fuel, Wallet, Users, Calendar } from 'lucide-react';

interface DashboardMetricsProps {
  metrics: MetricsType;
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  vehicles: Vehicle[];
  locations: LocationItem[];
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  trips,
  fuelLogs,
  expenses,
  vehicles,
  locations
}) => {
  return (
    <div className="space-y-4">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Available Vehicles</span>
            <span className="text-xl font-black text-slate-900 font-mono">{vehicles.length || 52}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Active Trips</span>
            <span className="text-xl font-black text-slate-900 font-mono">{metrics.totalTripsToday}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Quantity Moved</span>
            <span className="text-xl font-black text-slate-900 font-mono">{metrics.totalQuantityMovedToday.toFixed(1)} T</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Site Headcount</span>
            <span className="text-xl font-black text-slate-900 font-mono">{metrics.attendanceRate}%</span>
          </div>
        </div>

      </div>

      {/* NEW: SOURCE TO DESTINATION MATERIAL MOVEMENT MATRIX */}
      <MaterialMatrix trips={trips} locations={locations} />

    </div>
  );
};
