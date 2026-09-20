'use client';

import React, { useState } from 'react';
import { Vehicle, LocationItem, User, Trip } from '@/lib/types';
import { 
  MapPin, Camera, Navigation, Send, CheckCircle, Package, Truck, Layers, 
  Gauge, Fuel, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface TripLogFormProps {
  vehicles: Vehicle[];
  locations: LocationItem[];
  drivers: User[];
  activeInTransitTrips: Trip[];
  onSubmitStartTrip: (data: {
    driver_id: string;
    vehicle_id: string;
    source_id: string;
    dest_id: string;
    material: string;
    quantity: number;
    unit: string;
    start_odometer?: number;
    fuel_range?: number;
    loading_gps_lat?: number;
    loading_gps_lng?: number;
    loading_photo_url?: string;
  }) => Promise<Trip | void>;
  onCompleteOffload: (
    tripId: string, 
    data: {
      end_odometer: number;
      offloading_photo_url?: string;
      offloading_gps_lat?: number;
      offloading_gps_lng?: number;
    }
  ) => Promise<void>;
}

export const TripLogForm: React.FC<TripLogFormProps> = ({
  vehicles,
  locations,
  drivers,
  activeInTransitTrips,
  onSubmitStartTrip,
  onCompleteOffload
}) => {
  const [stage, setStage] = useState<'loading' | 'offloading'>('loading');

  // Stage 1 State
  const defaultDriver = drivers.find(d => d.role === 'driver') || drivers[0];
  const [driverId, setDriverId] = useState(defaultDriver?.id || '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [sourceId, setSourceId] = useState(locations[0]?.id || '');
  const [destId, setDestId] = useState(locations[1]?.id || '');
  const [material, setMaterial] = useState('Aggregates 20mm');
  const [quantity, setQuantity] = useState<string>('15.5');
  const [unit, setUnit] = useState('Tons');
  const [startOdometer, setStartOdometer] = useState<string>('45210.0');
  const [fuelRange, setFuelRange] = useState<string>('420.0');

  const [isCapturingLoadingGPS, setIsCapturingLoadingGPS] = useState(false);
  const [loadingGpsCoords, setLoadingGpsCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946
  });
  const [loadingPhotoUrl, setLoadingPhotoUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
  );

  // Stage 2 State
  const [selectedActiveTripId, setSelectedActiveTripId] = useState<string>(activeInTransitTrips[0]?.id || '');
  const [endOdometer, setEndOdometer] = useState<string>('45238.5');
  const [isCapturingOffloadingGPS, setIsCapturingOffloadingGPS] = useState(false);
  const [offloadingGpsCoords, setOffloadingGpsCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.9820,
    lng: 77.6045
  });
  const [offloadingPhotoUrl, setOffloadingPhotoUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const materialsList = [
    'Aggregates 20mm',
    'Crushed M-Sand',
    'River Sand',
    'Sub-base Gravel',
    'Ready-Mix Concrete (M30)',
    'Cement Bags',
    'Steel Rebar Bundle'
  ];

  const handleCaptureLoadingGPS = () => {
    setIsCapturingLoadingGPS(true);
    setTimeout(() => {
      setLoadingGpsCoords({ lat: 12.9716, lng: 77.5946 });
      setIsCapturingLoadingGPS(false);
    }, 1000);
  };

  const handleCaptureOffloadingGPS = () => {
    setIsCapturingOffloadingGPS(true);
    setTimeout(() => {
      setOffloadingGpsCoords({ lat: 12.9820, lng: 77.6045 });
      setIsCapturingOffloadingGPS(false);
    }, 1000);
  };

  const handleStartTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !sourceId || !destId || !quantity) return;

    setIsSubmitting(true);
    try {
      const createdTrip = await onSubmitStartTrip({
        driver_id: driverId,
        vehicle_id: vehicleId,
        source_id: sourceId,
        dest_id: destId,
        material,
        quantity: parseFloat(quantity) || 0,
        unit,
        start_odometer: parseFloat(startOdometer) || undefined,
        fuel_range: parseFloat(fuelRange) || undefined,
        loading_gps_lat: loadingGpsCoords?.lat,
        loading_gps_lng: loadingGpsCoords?.lng,
        loading_photo_url: loadingPhotoUrl || undefined
      });

      setSuccessMessage('Trip departure recorded successfully!');
      if (createdTrip) setSelectedActiveTripId(createdTrip.id);
      setTimeout(() => {
        setSuccessMessage(null);
        setStage('offloading');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOffloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeTrip = activeInTransitTrips.find(t => t.id === selectedActiveTripId) || activeInTransitTrips[0];
    if (!activeTrip) return;

    setIsSubmitting(true);
    try {
      await onCompleteOffload(activeTrip.id, {
        end_odometer: parseFloat(endOdometer) || 0,
        offloading_photo_url: offloadingPhotoUrl || undefined,
        offloading_gps_lat: offloadingGpsCoords?.lat,
        offloading_gps_lng: offloadingGpsCoords?.lng
      });

      setSuccessMessage('Material offload & drop location verified!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setStage('loading');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTripForOffload = activeInTransitTrips.find(t => t.id === selectedActiveTripId) || activeInTransitTrips[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Driver Trip Logger</h2>
            <p className="text-xs text-slate-500">2-Stage Fill Up → Drop Offload</p>
          </div>
        </div>

        {activeInTransitTrips.length > 0 && (
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
            {activeInTransitTrips.length} Active Trip
          </span>
        )}
      </div>

      {/* Stage Selector Pills */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setStage('loading')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            stage === 'loading'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Loading & Fill Up
        </button>

        <button
          type="button"
          onClick={() => setStage('offloading')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            stage === 'offloading'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Destination Drop
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* STAGE 1 FORM */}
      {stage === 'loading' && (
        <form onSubmit={handleStartTripSubmit} className="space-y-4 text-xs">
          
          {/* Driver & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Driver</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.vehicle_number} - {v.model}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Odo & Fuel Range */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Start Odometer (km)</label>
              <input
                type="number"
                step="0.1"
                value={startOdometer}
                onChange={(e) => setStartOdometer(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Fuel Range (km)</label>
              <input
                type="number"
                value={fuelRange}
                onChange={(e) => setFuelRange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Locations & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Source Fill-Up Location</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Destination Location</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Material & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              >
                {materialsList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quantity (Tons)</label>
              <input
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Loading Photo & GPS */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Raw Material Fill Photo & GPS</span>
              <button type="button" onClick={handleCaptureLoadingGPS} className="text-blue-600 font-bold hover:underline">
                {isCapturingLoadingGPS ? 'Locating...' : 'GPS Captured'}
              </button>
            </div>

            {loadingPhotoUrl && (
              <div className="rounded-lg overflow-hidden h-28 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loadingPhotoUrl} alt="Material loaded preview" className="w-full object-cover h-28" />
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Record Fill-Up & Start Trip</span>
          </button>
        </form>
      )}

      {/* STAGE 2 FORM */}
      {stage === 'offloading' && (
        <form onSubmit={handleCompleteOffloadSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Active Trip</label>
            {activeInTransitTrips.length === 0 ? (
              <p className="text-slate-500 py-3 text-center bg-slate-50 rounded-xl border border-slate-200">
                No active trips. Please start a trip in Stage 1 first.
              </p>
            ) : (
              <select
                value={selectedActiveTripId}
                onChange={(e) => setSelectedActiveTripId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                {activeInTransitTrips.map((t) => (
                  <option key={t.id} value={t.id}>{t.vehicle_number} — {t.material} ({t.quantity} Tons)</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Final Destination Odometer (km)</label>
            <input
              type="number"
              step="0.1"
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
            />
          </div>

          {/* Offloading Photo & GPS */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Drop Area Photo & GPS</span>
              <button type="button" onClick={handleCaptureOffloadingGPS} className="text-blue-600 font-bold hover:underline">
                {isCapturingOffloadingGPS ? 'Locating...' : 'GPS Captured'}
              </button>
            </div>

            {offloadingPhotoUrl && (
              <div className="rounded-lg overflow-hidden h-28 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={offloadingPhotoUrl} alt="Drop area preview" className="w-full object-cover h-28" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || activeInTransitTrips.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Offload & Finish Trip</span>
          </button>
        </form>
      )}

    </div>
  );
};
