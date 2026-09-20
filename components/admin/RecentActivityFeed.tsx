'use client';

import React from 'react';
import { Trip, FuelLog, Expense } from '@/lib/types';
import { Truck, Fuel, Wallet, Calendar } from 'lucide-react';

interface RecentActivityFeedProps {
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  trips,
  fuelLogs,
  expenses
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Real-Time Audit Stream</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        
        {/* Trips */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Trips ({trips.length})
          </h4>
          <div className="space-y-2">
            {trips.slice(0, 5).map((t) => (
              <div key={t.id} className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t.vehicle_number}</span>
                  <span className="text-blue-600 font-mono">{t.quantity} Tons</span>
                </div>
                <div className="text-[11px] text-slate-500">{t.material}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-sky-600" /> Fuel Refills ({fuelLogs.length})
          </h4>
          <div className="space-y-2">
            {fuelLogs.slice(0, 5).map((f) => (
              <div key={f.id} className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{f.vehicle_number}</span>
                  <span className="text-sky-600 font-mono">{f.litres} L</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">₹{f.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-purple-600" /> Petty Cash ({expenses.length})
          </h4>
          <div className="space-y-2">
            {expenses.slice(0, 5).map((e) => (
              <div key={e.id} className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="truncate pr-2">{e.vendor}</span>
                  <span className="text-purple-600 font-mono">₹{e.amount.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 capitalize">{e.category.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
