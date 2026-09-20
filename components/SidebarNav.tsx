'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { 
  Home, LayoutDashboard, Truck, Users, MapPin, 
  Bell, Menu, X, ShieldCheck, Heart, Flag, Layers, Compass 
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface SidebarNavProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeRole, onSelectRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'driver' as UserRole, label: 'Driver Trips', icon: Truck },
    { id: 'supervisor' as UserRole, label: 'Site Operations', icon: Users },
    { id: 'admin' as UserRole, label: 'Analytics Dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* LEFT VERTICAL ICON SIDEBAR (Matches the dark left sidebar in user mockup image) */}
      <aside className="hidden md:flex flex-col items-center py-5 px-3 bg-slate-950 text-slate-400 border-r border-slate-900 w-16 fixed top-0 left-0 bottom-0 z-50">
        
        {/* Brand Logo Icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 mb-8 cursor-pointer">
          <Truck className="w-5 h-5" />
        </div>

        {/* Vertical Icon Menu Stack */}
        <nav className="flex-1 space-y-4">
          <button
            onClick={() => onSelectRole('driver')}
            title="Driver Shift & Trips"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeRole === 'driver'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Truck className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectRole('supervisor')}
            title="Site Supervisor Operations"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeRole === 'supervisor'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            title="Admin Analytics Portal"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          <div className="w-8 h-px bg-slate-900 mx-auto my-2" />

          <button title="Map Locations" className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-slate-200 transition-colors">
            <Compass className="w-5 h-5" />
          </button>

          <button title="Site Reports" className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-slate-200 transition-colors">
            <Flag className="w-5 h-5" />
          </button>
        </nav>

        {/* Bottom Status Dot */}
        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" title="System Live" />
      </aside>

      {/* TOP HEADER BAR (Matches top mobile navigation header in inspiration mockup) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 md:pl-16 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Left Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                SSI Fleet
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}
              </span>
            </div>
          </div>

          {/* Quick Role Toggle Bar */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectRole(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRole === item.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Bell & User Profile Avatar */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              {activeRole === 'driver' ? 'RK' : activeRole === 'supervisor' ? 'AS' : 'PP'}
            </div>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Persona View</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectRole(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  activeRole === item.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>
    </>
  );
};
