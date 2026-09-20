'use client';

import { useState, useEffect } from 'react';
import { 
  User, Vehicle, LocationItem, Trip, FuelLog, Expense, AttendanceRecord, 
  DashboardMetrics, UserRole, AttendanceStatus 
} from './types';
import { 
  initialUsers, initialVehicles, initialLocations, 
  initialTrips, initialFuelLogs, initialExpenses, initialAttendance 
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  USERS: 'ssi_users_v4',
  VEHICLES: 'ssi_vehicles_v4',
  LOCATIONS: 'ssi_locations_v4',
  TRIPS: 'ssi_trips_v4',
  FUEL_LOGS: 'ssi_fuel_logs_v4',
  EXPENSES: 'ssi_expenses_v4',
  ATTENDANCE: 'ssi_attendance_v4',
  ACTIVE_ROLE: 'ssi_active_role_v4'
};

const isValidUUID = (str?: string) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const ensureUUID = (id?: string, fallback: string = '11111111-1111-1111-1111-111111111111') => {
  if (id && isValidUUID(id)) return id;
  return fallback;
};

export function useFleetStore() {
  const [activeRole, setActiveRoleState] = useState<UserRole>('driver');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch Universal Live Data from Supabase
  const fetchFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const [uRes, vRes, lRes, tRes, fRes, eRes, aRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('locations').select('*'),
        supabase.from('trips').select('*').order('created_at', { ascending: false }),
        supabase.from('fuel_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('attendance').select('*')
      ]);

      const loadedUsers = uRes.data?.length ? uRes.data : users;
      const loadedVehicles = vRes.data?.length ? vRes.data : vehicles;
      const loadedLocations = lRes.data?.length ? lRes.data : locations;

      if (uRes.data?.length) setUsers(uRes.data);
      if (vRes.data?.length) setVehicles(vRes.data);
      if (lRes.data?.length) setLocations(lRes.data);

      if (tRes.data) {
        const formattedTrips = tRes.data.map((t: Trip) => {
          const drv = loadedUsers.find(u => u.id === t.driver_id);
          const veh = loadedVehicles.find(v => v.id === t.vehicle_id);
          const src = loadedLocations.find(l => l.id === t.source_id);
          const dst = loadedLocations.find(l => l.id === t.dest_id);

          return {
            ...t,
            driver_name: drv?.name || t.driver_name || 'Driver',
            vehicle_number: veh?.vehicle_number || t.vehicle_number || 'Vehicle',
            source_name: src?.name || t.source_name || 'Source Quarry',
            dest_name: dst?.name || t.dest_name || 'Destination Site'
          };
        });
        setTrips(formattedTrips);
      }

      if (fRes.data) {
        const formattedFuel = fRes.data.map((f: FuelLog) => {
          const drv = loadedUsers.find(u => u.id === f.driver_id);
          const veh = loadedVehicles.find(v => v.id === f.vehicle_id);
          return {
            ...f,
            driver_name: drv?.name || f.driver_name || 'Driver',
            vehicle_number: veh?.vehicle_number || f.vehicle_number || 'Vehicle'
          };
        });
        setFuelLogs(formattedFuel);
      }

      if (eRes.data) {
        const formattedExpenses = eRes.data.map((e: Expense) => {
          const sup = loadedUsers.find(u => u.id === e.supervisor_id);
          return {
            ...e,
            supervisor_name: sup?.name || e.supervisor_name || 'Supervisor'
          };
        });
        setExpenses(formattedExpenses);
      }

      if (aRes.data) {
        const formattedAttendance = aRes.data.map((a: AttendanceRecord) => {
          const emp = loadedUsers.find(u => u.id === a.employee_id);
          return {
            ...a,
            employee_name: emp?.name || a.employee_name || 'Employee',
            employee_role: emp?.role || a.employee_role || 'driver'
          };
        });
        setAttendance(formattedAttendance);
      }
    } catch (err) {
      console.error('Error fetching live Supabase data', err);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole | null;
    if (savedRole) setActiveRoleState(savedRole);

    const client = supabase;
    if (isSupabaseConfigured && client) {
      // 1. Initial Fetch from Cloud DB
      fetchFromSupabase().then(() => setIsLoaded(true));

      // 2. Background Auto-Poll every 4 seconds for instant cross-device updates
      const interval = setInterval(() => {
        fetchFromSupabase();
      }, 4000);

      // 3. Supabase Realtime Channel Subscription
      const channel = client.channel('universal-fleet-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_logs' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetchFromSupabase())
        .subscribe();

      return () => {
        clearInterval(interval);
        client.removeChannel(channel);
      };
    } else {
      // LocalStorage Fallback for offline/demo mode
      try {
        const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (savedUsers) setUsers(JSON.parse(savedUsers));

        const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
        if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

        const savedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
        if (savedLocations) setLocations(JSON.parse(savedLocations));

        const savedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        if (savedTrips) setTrips(JSON.parse(savedTrips));

        const savedFuelLogs = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
        if (savedFuelLogs) setFuelLogs(JSON.parse(savedFuelLogs));

        const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

        const savedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
        if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
      } catch (e) {
        console.warn('Storage fallback to default mock data', e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    }
  };

  // Create Loading Trip
  const addTrip = async (newTrip: Omit<Trip, 'id' | 'created_at' | 'status'>) => {
    const driver = users.find(u => u.id === newTrip.driver_id) || users[0];
    const vehicle = vehicles.find(v => v.id === newTrip.vehicle_id) || vehicles[0];
    const source = locations.find(l => l.id === newTrip.source_id) || locations[0];
    const dest = locations.find(l => l.id === newTrip.dest_id) || locations[1];

    const safeDriverId = ensureUUID(newTrip.driver_id, driver?.id || '11111111-1111-1111-1111-111111111111');
    const safeVehicleId = ensureUUID(newTrip.vehicle_id, vehicle?.id || 'a1111111-1111-1111-1111-111111111111');
    const safeSourceId = ensureUUID(newTrip.source_id, source?.id || 'b1111111-1111-1111-1111-111111111111');
    const safeDestId = ensureUUID(newTrip.dest_id, dest?.id || 'b3333333-3333-3333-3333-333333333333');

    const tripRecord: Trip = {
      ...newTrip,
      driver_id: safeDriverId,
      vehicle_id: safeVehicleId,
      source_id: safeSourceId,
      dest_id: safeDestId,
      id: crypto.randomUUID ? crypto.randomUUID() : `c${Date.now()}-1111-1111-1111-111111111111`,
      status: 'in_transit',
      created_at: new Date().toISOString(),
      driver_name: driver?.name || 'Driver',
      vehicle_number: vehicle?.vehicle_number || 'TRK-00',
      source_name: source?.name || 'Source',
      dest_name: dest?.name || 'Destination'
    };

    setTrips(prev => [tripRecord, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('trips').insert([{
          driver_id: safeDriverId,
          vehicle_id: safeVehicleId,
          source_id: safeSourceId,
          dest_id: safeDestId,
          material: newTrip.material,
          quantity: newTrip.quantity,
          unit: newTrip.unit || 'Tons',
          start_odometer: newTrip.start_odometer,
          fuel_range: newTrip.fuel_range,
          loading_photo_url: newTrip.loading_photo_url,
          loading_gps_lat: newTrip.loading_gps_lat,
          loading_gps_lng: newTrip.loading_gps_lng,
          loading_gps_address: newTrip.loading_gps_address,
          status: 'in_transit'
        }]);

        if (error) {
          console.error('Supabase trip insert error:', error.message);
        } else {
          setTimeout(fetchFromSupabase, 500);
        }
      } catch (err) {
        console.error('Failed syncing loading trip to Supabase', err);
      }
    }
    return tripRecord;
  };

  // Complete Offload
  const completeTripOffload = async (
    tripId: string, 
    offloadData: {
      end_odometer: number;
      offloading_photo_url?: string;
      offloading_gps_lat?: number;
      offloading_gps_lng?: number;
      offloading_gps_address?: string;
    }
  ) => {
    const offloadedTime = new Date().toISOString();
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          ...offloadData,
          status: 'completed' as const,
          offloaded_at: offloadedTime
        };
      }
      return t;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        if (isValidUUID(tripId)) {
          await supabase.from('trips').update({
            end_odometer: offloadData.end_odometer,
            offloading_photo_url: offloadData.offloading_photo_url,
            offloading_gps_lat: offloadData.offloading_gps_lat,
            offloading_gps_lng: offloadData.offloading_gps_lng,
            offloading_gps_address: offloadData.offloading_gps_address,
            status: 'completed',
            offloaded_at: offloadedTime
          }).eq('id', tripId);
        } else {
          await supabase.from('trips').update({
            end_odometer: offloadData.end_odometer,
            offloading_photo_url: offloadData.offloading_photo_url,
            offloading_gps_lat: offloadData.offloading_gps_lat,
            offloading_gps_lng: offloadData.offloading_gps_lng,
            offloading_gps_address: offloadData.offloading_gps_address,
            status: 'completed',
            offloaded_at: offloadedTime
          }).eq('status', 'in_transit');
        }

        setTimeout(fetchFromSupabase, 500);
      } catch (err) {
        console.error('Failed syncing trip completion to Supabase', err);
      }
    }
  };

  // Add Fuel Log
  const addFuelLog = async (newLog: Omit<FuelLog, 'id' | 'created_at'>) => {
    const driver = users.find(u => u.id === newLog.driver_id) || users[0];
    const vehicle = vehicles.find(v => v.id === newLog.vehicle_id) || vehicles[0];

    const safeDriverId = ensureUUID(newLog.driver_id, driver?.id || '11111111-1111-1111-1111-111111111111');
    const safeVehicleId = ensureUUID(newLog.vehicle_id, vehicle?.id || 'a1111111-1111-1111-1111-111111111111');

    const fuelRecord: FuelLog = {
      ...newLog,
      driver_id: safeDriverId,
      vehicle_id: safeVehicleId,
      id: crypto.randomUUID ? crypto.randomUUID() : `d${Date.now()}-1111-1111-1111-111111111111`,
      created_at: new Date().toISOString(),
      driver_name: driver?.name || 'Driver',
      vehicle_number: vehicle?.vehicle_number || 'TRK-00'
    };

    setFuelLogs(prev => [fuelRecord, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fuel_logs').insert([{
          driver_id: safeDriverId,
          vehicle_id: safeVehicleId,
          odometer: newLog.odometer,
          litres: newLog.litres,
          amount: newLog.amount,
          receipt_url: newLog.receipt_url
        }]);
        setTimeout(fetchFromSupabase, 500);
      } catch (err) {
        console.error('Failed syncing fuel log to Supabase', err);
      }
    }
    return fuelRecord;
  };

  // Add Expense
  const addExpense = async (newExp: Omit<Expense, 'id' | 'created_at'>) => {
    const supervisor = users.find(u => u.id === newExp.supervisor_id) || users.find(u => u.role === 'supervisor') || users[0];
    const safeSupervisorId = ensureUUID(newExp.supervisor_id, supervisor?.id || '33333333-3333-3333-3333-333333333333');

    const expenseRecord: Expense = {
      ...newExp,
      supervisor_id: safeSupervisorId,
      id: crypto.randomUUID ? crypto.randomUUID() : `e${Date.now()}-1111-1111-1111-111111111111`,
      created_at: new Date().toISOString(),
      supervisor_name: supervisor?.name || 'Supervisor'
    };

    setExpenses(prev => [expenseRecord, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expenses').insert([{
          supervisor_id: safeSupervisorId,
          category: newExp.category,
          amount: newExp.amount,
          vendor: newExp.vendor,
          bill_url: newExp.bill_url,
          notes: newExp.notes
        }]);
        setTimeout(fetchFromSupabase, 500);
      } catch (err) {
        console.error('Failed syncing expense to Supabase', err);
      }
    }
    return expenseRecord;
  };

  // Update Attendance Status
  const markAttendance = async (employeeId: string, status: AttendanceStatus, supervisorId: string = '33333333-3333-3333-3333-333333333333') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const employee = users.find(u => u.id === employeeId);

    const safeEmployeeId = ensureUUID(employeeId, '11111111-1111-1111-1111-111111111111');
    const safeSupervisorId = ensureUUID(supervisorId, '33333333-3333-3333-3333-333333333333');

    setAttendance(prev => {
      const idx = prev.findIndex(a => a.employee_id === employeeId && a.date === todayStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], status, supervisor_id: safeSupervisorId };
        return copy;
      }
      return [{
        id: crypto.randomUUID ? crypto.randomUUID() : `f${Date.now()}-1111-1111-1111-111111111111`,
        supervisor_id: safeSupervisorId,
        employee_id: safeEmployeeId,
        status,
        date: todayStr,
        created_at: new Date().toISOString(),
        employee_name: employee?.name || 'Employee',
        employee_role: employee?.role || 'driver'
      }, ...prev];
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attendance').upsert({
          supervisor_id: safeSupervisorId,
          employee_id: safeEmployeeId,
          status,
          date: todayStr
        }, { onConflict: 'employee_id,date' });
        setTimeout(fetchFromSupabase, 500);
      } catch (err) {
        console.error('Failed syncing attendance to Supabase', err);
      }
    }
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const userItem: User = { 
      ...newUser, 
      id: crypto.randomUUID ? crypto.randomUUID() : `11111111-1111-1111-1111-${Date.now().toString().slice(-12)}` 
    };
    setUsers(prev => [...prev, userItem]);
  };

  const addVehicle = (newVeh: Omit<Vehicle, 'id'>) => {
    const vehItem: Vehicle = { 
      ...newVeh, 
      id: crypto.randomUUID ? crypto.randomUUID() : `a1111111-1111-1111-1111-${Date.now().toString().slice(-12)}` 
    };
    setVehicles(prev => [...prev, vehItem]);
  };

  const addLocation = (newLoc: Omit<LocationItem, 'id'>) => {
    const locItem: LocationItem = { 
      ...newLoc, 
      id: crypto.randomUUID ? crypto.randomUUID() : `b1111111-1111-1111-1111-${Date.now().toString().slice(-12)}` 
    };
    setLocations(prev => [...prev, locItem]);
  };

  const metrics: DashboardMetrics = {
    totalTripsToday: trips.length,
    totalQuantityMovedToday: trips.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0),
    totalFuelLoggedToday: fuelLogs.reduce((acc, f) => acc + (Number(f.amount) || 0), 0),
    totalFuelLitresToday: fuelLogs.reduce((acc, f) => acc + (Number(f.litres) || 0), 0),
    totalExpensesToday: expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    headcountPresent: attendance.filter(a => a.status === 'present' || a.status === 'half_day').length,
    headcountTotal: users.length,
    attendanceRate: users.length > 0 
      ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'half_day').length / users.length) * 100) 
      : 0
  };

  return {
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
  };
}
