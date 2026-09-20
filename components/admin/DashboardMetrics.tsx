'use client';

import React from 'react';
import { DashboardMetrics as MetricsType, Trip, FuelLog, Expense, Vehicle } from '@/lib/types';
import { Truck, Layers, Fuel, Wallet, Users, Calendar, ArrowUpRight } from 'lucide-react';

interface DashboardMetricsProps {
  metrics: MetricsType;
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  vehicles: Vehicle[];
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  trips,
  fuelLogs,
  expenses,
  vehicles
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

      {/* Analytics Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-sm font-extrabold text-slate-900">Today's Material Dispatched</h3>
          <span className="text-xs font-bold text-blue-600">{metrics.totalQuantityMovedToday.toFixed(1)} Tons Total</span>
        </div>

        <div className="space-y-3 pt-1">
          {[
            { name: 'Aggregates 20mm', tons: 15.5, pct: 52 },
            { name: 'Crushed M-Sand', tons: 14.0, pct: 48 },
          ].map((m) => (
            <div key={m.name} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{m.name}</span>
                <span className="font-mono text-blue-600">{m.tons} Tons ({m.pct}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
