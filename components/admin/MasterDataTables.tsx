'use client';

import React, { useState } from 'react';
import { User, Vehicle, LocationItem, UserRole, LocationType } from '@/lib/types';
import { Users, Truck, MapPin, Plus, Search, CheckCircle2, X } from 'lucide-react';

interface MasterDataTablesProps {
  users: User[];
  vehicles: Vehicle[];
  locations: LocationItem[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onAddLocation: (location: Omit<LocationItem, 'id'>) => void;
}

export const MasterDataTables: React.FC<MasterDataTablesProps> = ({
  users,
  vehicles,
  locations,
  onAddUser,
  onAddVehicle,
  onAddLocation
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'locations' | 'users'>('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User form
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('driver');
  const [userPhone, setUserPhone] = useState('');

  // Vehicle form
  const [vehNum, setVehNum] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehType, setVehType] = useState('Tipper Truck');
  const [vehCap, setVehCap] = useState('16 Tons');

  // Location form
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState<LocationType>('construction_site');
  const [locAddress, setLocAddress] = useState('');

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'users') {
      if (!userName) return;
      onAddUser({ name: userName, role: userRole, phone: userPhone || undefined });
      setUserName('');
    } else if (activeTab === 'vehicles') {
      if (!vehNum || !vehModel) return;
      onAddVehicle({ vehicle_number: vehNum, model: vehModel, type: vehType, capacity: vehCap, status: 'Active' });
      setVehNum('');
    } else if (activeTab === 'locations') {
      if (!locName) return;
      onAddLocation({ name: locName, type: locType, address: locAddress || undefined });
      setLocName('');
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVehicles = vehicles.filter(v => v.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLocations = locations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Master Data Registry</h2>
          <p className="text-xs text-slate-500">Manage System Users, Vehicles, and Site Locations</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              activeTab === 'vehicles' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              activeTab === 'locations' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      {activeTab === 'vehicles' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold font-mono text-blue-600">{v.vehicle_number}</td>
                  <td className="px-4 py-2.5 text-slate-900">{v.model}</td>
                  <td className="px-4 py-2.5 text-slate-600">{v.type}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{v.status || 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Locations Table */}
      {activeTab === 'locations' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Site / Quarry Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLocations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{loc.name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{loc.type.replace('_', ' ')}</td>
                  <td className="px-4 py-2.5 text-slate-500">{loc.address || 'Geo Zone Site'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{u.name}</td>
                  <td className="px-4 py-2.5 capitalize text-blue-600 font-bold">{u.role}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{u.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 capitalize">Add New {activeTab.slice(0, -1)}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              {activeTab === 'users' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vehicle Registration No.</label>
                  <input
                    type="text"
                    required
                    value={vehNum}
                    onChange={(e) => setVehNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 uppercase font-mono"
                  />
                </div>
              )}

              {activeTab === 'locations' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
