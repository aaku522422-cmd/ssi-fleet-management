'use client';

import React, { useState } from 'react';
import { useFleetStore } from '@/lib/store';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { TripLogForm } from '@/components/driver/TripLogForm';
import { FuelLogForm } from '@/components/driver/FuelLogForm';
import { AttendanceList } from '@/components/supervisor/AttendanceList';
import { ExpenseLogForm } from '@/components/supervisor/ExpenseLogForm';
import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { MasterDataTables } from '@/components/admin/MasterDataTables';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { 
  Truck, Fuel, Users, Wallet, LayoutDashboard, Database, 
  MapPin, Clock, FileText, Activity 
} from 'lucide-react';

export default function Home() {
  const {
    isLoaded,
    activeRole,
    setActiveRole,
    users,
    vehicles,
    locations,
    trips,
    fuelLogs,
    expenses,
    attendance,
    metrics,
    addTrip,
    completeTripOffload,
    addFuelLog,
    addExpense,
    markAttendance,
    addUser,
    addVehicle,
    addLocation
  } = useFleetStore();

  const [driverTab, setDriverTab] = useState<'trip' | 'fuel' | 'history'>('trip');
  const [supervisorTab, setSupervisorTab] = useState<'attendance' | 'expenses' | 'summary'>('attendance');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'master' | 'audit'>('dashboard');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-600 font-bold">Loading SSI Fleet Management...</p>
      </div>
    );
  }

  const activeInTransitTrips = trips.filter(t => t.status === 'in_transit');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header with Dark Navy Branding & Persona Selector */}
      <RoleSwitcher activeRole={activeRole} onSelectRole={setActiveRole} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 pb-20 sm:pb-8">
        
        {/* ROLE A: DRIVER (Mobile UI) */}
        {activeRole === 'driver' && (
          <div className="max-w-md mx-auto space-y-4">
            
            {/* Driver Role Header Card */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Driver Portal</span>
                <h2 className="text-base font-extrabold leading-tight">Welcome, Rajesh Kumar</h2>
                <p className="text-xs text-slate-400">Truck: KA-04-TR-9021 (Volvo FMX)</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                RK
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setDriverTab('trip')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driverTab === 'trip'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>2-Stage Trip</span>
              </button>

              <button
                onClick={() => setDriverTab('fuel')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driverTab === 'fuel'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Fuel Log</span>
              </button>

              <button
                onClick={() => setDriverTab('history')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driverTab === 'history'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>My Logs</span>
              </button>
            </div>

            {/* Tab Content */}
            {driverTab === 'trip' && (
              <TripLogForm
                vehicles={vehicles}
                locations={locations}
                drivers={users.filter(u => u.role === 'driver')}
                activeInTransitTrips={activeInTransitTrips}
                onSubmitStartTrip={async (data) => {
                  return await addTrip(data);
                }}
                onCompleteOffload={async (tripId, offloadData) => {
                  await completeTripOffload(tripId, offloadData);
                }}
              />
            )}

            {driverTab === 'fuel' && (
              <FuelLogForm
                vehicles={vehicles}
                drivers={users.filter(u => u.role === 'driver')}
                onSubmit={async (data) => {
                  await addFuelLog(data);
                }}
              />
            )}

            {driverTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-sm text-xs">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Recent Trips
                </h3>
                <div className="space-y-2">
                  {trips.slice(0, 5).map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{t.vehicle_number}</span>
                        <span className="text-blue-600 font-mono">{t.quantity} Tons</span>
                      </div>
                      <p className="text-slate-600">{t.material}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ROLE B: SITE SUPERVISOR (Mobile UI) */}
        {activeRole === 'supervisor' && (
          <div className="max-w-md mx-auto space-y-4">
            
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Supervisor Portal</span>
                <h2 className="text-base font-extrabold leading-tight">Amit Sharma</h2>
                <p className="text-xs text-slate-400">Flyover Site C (NH-44)</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                AS
              </div>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setSupervisorTab('attendance')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  supervisorTab === 'attendance'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Attendance</span>
              </button>

              <button
                onClick={() => setSupervisorTab('expenses')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  supervisorTab === 'expenses'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Petty Cash</span>
              </button>
            </div>

            {supervisorTab === 'attendance' && (
              <AttendanceList
                employees={users}
                attendanceRecords={attendance}
                onMarkAttendance={async (empId, status) => {
                  await markAttendance(empId, status);
                }}
              />
            )}

            {supervisorTab === 'expenses' && (
              <ExpenseLogForm
                supervisors={users.filter(u => u.role === 'supervisor')}
                recentExpenses={expenses}
                onSubmit={async (data) => {
                  await addExpense(data);
                }}
              />
            )}

          </div>
        )}

        {/* ROLE C: ADMIN (Desktop/Responsive UI) */}
        {activeRole === 'admin' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Admin Dashboard</h2>
                <p className="text-xs text-slate-500">Source Quarries & Destination Sites Material Movement</p>
              </div>

              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto">
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Dashboard & Matrix
                </button>
                <button
                  onClick={() => setAdminTab('master')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminTab === 'master' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Master Data
                </button>
                <button
                  onClick={() => setAdminTab('audit')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminTab === 'audit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Audit Stream
                </button>
              </div>
            </div>

            {adminTab === 'dashboard' && (
              <DashboardMetrics
                metrics={metrics}
                trips={trips}
                fuelLogs={fuelLogs}
                expenses={expenses}
                vehicles={vehicles}
                locations={locations}
              />
            )}

            {adminTab === 'master' && (
              <MasterDataTables
                users={users}
                vehicles={vehicles}
                locations={locations}
                onAddUser={addUser}
                onAddVehicle={addVehicle}
                onAddLocation={addLocation}
              />
            )}

            {adminTab === 'audit' && (
              <RecentActivityFeed
                trips={trips}
                fuelLogs={fuelLogs}
                expenses={expenses}
              />
            )}

          </div>
        )}

      </main>

      {/* Sticky Bottom Mobile Navigation Bar */}
      <MobileBottomNav activeRole={activeRole} onSelectRole={setActiveRole} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 hidden sm:block">
        <p>SSI Digital Construction Site & Fleet Management System</p>
      </footer>
    </div>
  );
}
