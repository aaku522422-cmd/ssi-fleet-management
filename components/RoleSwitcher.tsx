'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { Truck, HardHat, ShieldCheck, CheckCircle2, Database, Wifi } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface RoleSwitcherProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeRole, onSelectRole }) => {
  const roles: { id: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'driver', label: 'Driver', icon: Truck },
    { id: 'supervisor', label: 'Supervisor', icon: HardHat },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* App Title & Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">SSI Fleet & Site</h1>
              <p className="text-[11px] text-slate-400 font-medium">Digital Fleet Operations</p>
            </div>
          </div>

          {/* Supabase Status Badge */}
          <div className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
            isSupabaseConfigured 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}</span>
          </div>
        </div>

        {/* Persona Selector Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
