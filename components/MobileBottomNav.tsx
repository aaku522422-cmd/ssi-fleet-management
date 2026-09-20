'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { Truck, HardHat, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeRole, onSelectRole }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-2 sm:hidden shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectRole('driver')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeRole === 'driver' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Driver</span>
        </button>

        <button
          onClick={() => onSelectRole('supervisor')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeRole === 'supervisor' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <HardHat className="w-5 h-5" />
          <span className="text-[10px]">Supervisor</span>
        </button>

        <button
          onClick={() => onSelectRole('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeRole === 'admin' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Admin</span>
        </button>
      </div>
    </div>
  );
};
