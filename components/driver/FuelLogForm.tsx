'use client';

import React, { useState } from 'react';
import { Vehicle, User } from '@/lib/types';
import { Fuel, Receipt, Camera, CheckCircle, Send, Gauge } from 'lucide-react';

interface FuelLogFormProps {
  vehicles: Vehicle[];
  drivers: User[];
  onSubmit: (data: {
    driver_id: string;
    vehicle_id: string;
    odometer: number;
    litres: number;
    amount: number;
    receipt_url?: string;
  }) => Promise<void>;
}

export const FuelLogForm: React.FC<FuelLogFormProps> = ({
  vehicles,
  drivers,
  onSubmit
}) => {
  const defaultDriver = drivers.find(d => d.role === 'driver') || drivers[0];
  const [driverId, setDriverId] = useState(defaultDriver?.id || '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [odometer, setOdometer] = useState<string>('45250.0');
  const [litres, setLitres] = useState<string>('80.0');
  const [amount, setAmount] = useState<string>('7360.00');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setReceiptUrl(base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !odometer || !litres || !amount) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        driver_id: driverId,
        vehicle_id: vehicleId,
        odometer: parseFloat(odometer) || 0,
        litres: parseFloat(litres) || 0,
        amount: parseFloat(amount) || 0,
        receipt_url: receiptUrl || undefined
      });

      setSuccessMessage('Fuel log saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Fuel Log Entry</h2>
            <p className="text-xs text-slate-500">Record diesel refill & odometer state</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Driver</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicle_number}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Odometer Reading (km)</label>
          <input
            type="number"
            step="0.1"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Litres Pumped</label>
            <input
              type="number"
              value={litres}
              onChange={(e) => {
                const val = e.target.value;
                setLitres(val);
                if (val) setAmount((parseFloat(val) * 92).toFixed(2));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
            />
          </div>
        </div>

        {/* NATIVE MOBILE CAMERA FOR RECEIPT */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Fuel Pump Receipt Image</span>
            </span>

            <label htmlFor="fuelCameraInput" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]">
              <Camera className="w-3 h-3" />
              <span>Open Camera</span>
            </label>
          </div>

          <input
            id="fuelCameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptFileChange}
            className="hidden"
          />

          {receiptUrl && (
            <div className="relative rounded-xl overflow-hidden h-32 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={receiptUrl} alt="Fuel receipt slip" className="w-full object-cover h-32" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Send className="w-4 h-4" />
          <span>Submit Fuel Log</span>
        </button>
      </form>
    </div>
  );
};
