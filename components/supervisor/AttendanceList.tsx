'use client';

import React, { useState } from 'react';
import { User, AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { Users, UserCheck, UserX, Clock, Search, Calendar } from 'lucide-react';

interface AttendanceListProps {
  employees: User[];
  attendanceRecords: AttendanceRecord[];
  onMarkAttendance: (employeeId: string, status: AttendanceStatus) => Promise<void>;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  employees,
  attendanceRecords,
  onMarkAttendance
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | AttendanceStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const getEmployeeStatus = (employeeId: string): AttendanceStatus => {
    const record = attendanceRecords.find(a => a.employee_id === employeeId && a.date === todayStr);
    return record ? record.status : 'present';
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    return getEmployeeStatus(emp.id) === activeFilter;
  });

  const handleStatusChange = async (employeeId: string, status: AttendanceStatus) => {
    setUpdatingId(employeeId);
    try {
      await onMarkAttendance(employeeId, status);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const presentCount = employees.filter(e => getEmployeeStatus(e.id) === 'present').length;
  const halfDayCount = employees.filter(e => getEmployeeStatus(e.id) === 'half_day').length;
  const absentCount = employees.filter(e => getEmployeeStatus(e.id) === 'absent').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      
      {/* Header & Counts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Daily Site Attendance</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs self-stretch sm:self-auto justify-between">
          <span className="font-bold text-emerald-700">Present: {presentCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-amber-600">Half Day: {halfDayCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-rose-600">Absent: {absentCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employee name or role..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
        />
      </div>

      {/* Employee Cards */}
      <div className="space-y-2.5">
        {filteredEmployees.map((emp) => {
          const status = getEmployeeStatus(emp.id);
          const isUpdating = updatingId === emp.id;

          return (
            <div
              key={emp.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {emp.name[0]}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{emp.name}</h3>
                  <span className="text-[10px] text-slate-500 capitalize">{emp.role}</span>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(emp.id, 'present')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Present
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(emp.id, 'half_day')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === 'half_day'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Half Day
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(emp.id, 'absent')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Absent
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
