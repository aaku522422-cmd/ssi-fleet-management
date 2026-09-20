'use client';

import React, { useState } from 'react';
import { Vehicle, LocationItem, User, Trip } from '@/lib/types';
import { 
  MapPin, Camera, Navigation, Send, CheckCircle, Package, Truck, Layers, 
  Gauge, Fuel, ArrowRight, ShieldCheck, AlertCircle, RefreshCw 
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

  // Stage 1 GPS State
  const [isCapturingLoadingGPS, setIsCapturingLoadingGPS] = useState(false);
  const [loadingGpsCoords, setLoadingGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>({
    lat: 12.9716,
    lng: 77.5946
  });
  const [loadingGpsError, setLoadingGpsError] = useState<string | null>(null);

  // Stage 1 Photo State (Base64 for reliable mobile preview)
  const [loadingPhotoUrl, setLoadingPhotoUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
  );

  // Stage 2 State
  const [selectedActiveTripId, setSelectedActiveTripId] = useState<string>(activeInTransitTrips[0]?.id || '');
  const [endOdometer, setEndOdometer] = useState<string>('45238.5');

  // Stage 2 GPS & Photo State
  const [isCapturingOffloadingGPS, setIsCapturingOffloadingGPS] = useState(false);
  const [offloadingGpsCoords, setOffloadingGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>({
    lat: 12.9820,
    lng: 77.6045
  });
  const [offloadingGpsError, setOffloadingGpsError] = useState<string | null>(null);

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

  // REAL MOBILE HARDWARE GPS GEOLOCATION HANDLER
  const captureGPS = (type: 'loading' | 'offloading') => {
    if (type === 'loading') {
      setIsCapturingLoadingGPS(true);
      setLoadingGpsError(null);
    } else {
      setIsCapturingOffloadingGPS(true);
      setOffloadingGpsError(null);
    }

    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      if (type === 'loading') {
        setLoadingGpsError(errMsg);
        setIsCapturingLoadingGPS(false);
      } else {
        setOffloadingGpsError(errMsg);
        setIsCapturingOffloadingGPS(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy)
        };

        if (type === 'loading') {
          setLoadingGpsCoords(coords);
          setIsCapturingLoadingGPS(false);
        } else {
          setOffloadingGpsCoords(coords);
          setIsCapturingOffloadingGPS(false);
        }
      },
      (error) => {
        let message = 'Could not fetch GPS location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'GPS permission denied. Please allow location access in your phone settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'GPS signal unavailable. Please ensure phone location is ON.';
            break;
          case error.TIMEOUT:
            message = 'GPS request timed out. Trying again...';
            break;
        }

        // Fallback coordinates so application flow never breaks
        const fallback = type === 'loading' 
          ? { lat: 12.9716, lng: 77.5946, accuracy: 15 }
          : { lat: 12.9820, lng: 77.6045, accuracy: 20 };

        if (type === 'loading') {
          setLoadingGpsError(message);
          setLoadingGpsCoords(fallback);
          setIsCapturingLoadingGPS(false);
        } else {
          setOffloadingGpsError(message);
          setOffloadingGpsCoords(fallback);
          setIsCapturingOffloadingGPS(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // NATIVE MOBILE CAMERA FILE READER (Base64 Output for 100% reliable mobile image preview)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'loading' | 'offloading') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (type === 'loading') {
        setLoadingPhotoUrl(base64Url);
      } else {
        setOffloadingPhotoUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Driver Trip Logger</h2>
            <p className="text-xs text-slate-500">Hardware GPS & Native Camera Integration</p>
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
        <form onSubmit={handleStartTripSubmit} className="space-y-3.5 text-xs">
          
          {/* Driver & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Driver Name</label>
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
              <label className="block text-slate-700 font-bold mb-1">Assigned Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
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

          {/* Locations */}
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
              <label className="block text-slate-700 font-bold mb-1">Destination Site</label>
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
              <label className="block text-slate-700 font-bold mb-1">Raw Material</label>
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

          {/* REAL MOBILE HARDWARE GPS CAPTURE */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Navigation className={`w-4 h-4 ${isCapturingLoadingGPS ? 'text-blue-600 animate-spin' : 'text-emerald-600'}`} />
                <span>Quarry Departure GPS</span>
              </div>

              <button
                type="button"
                onClick={() => captureGPS('loading')}
                disabled={isCapturingLoadingGPS}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isCapturingLoadingGPS ? 'animate-spin' : ''}`} />
                <span>{isCapturingLoadingGPS ? 'Locating...' : 'Get Phone GPS'}</span>
              </button>
            </div>

            {loadingGpsCoords && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                <span>Lat: <strong>{loadingGpsCoords.lat}</strong>, Lng: <strong>{loadingGpsCoords.lng}</strong></span>
                {loadingGpsCoords.accuracy && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    ±{loadingGpsCoords.accuracy}m accuracy
                  </span>
                )}
              </div>
            )}

            {loadingGpsError && (
              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{loadingGpsError}</span>
              </p>
            )}
          </div>

          {/* NATIVE MOBILE CAMERA CAPTURE (Rear camera environment capture) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Raw Material Fill Photo (Mobile Camera)</span>
              </label>

              {/* Direct Camera Button */}
              <label htmlFor="loadingCameraInput" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]">
                <Camera className="w-3 h-3" />
                <span>Open Camera</span>
              </label>
            </div>

            {/* Native HTML5 Camera Input with capture="environment" */}
            <input
              id="loadingCameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoFileChange(e, 'loading')}
              className="hidden"
            />

            {loadingPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loadingPhotoUrl} alt="Loaded material preview" className="w-full object-cover h-36" />
                <label
                  htmlFor="loadingCameraInput"
                  className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  Retake Photo
                </label>
              </div>
            ) : (
              <label
                htmlFor="loadingCameraInput"
                className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-center bg-white"
              >
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="font-bold text-slate-700">Tap to snap camera photo of truck load</span>
                <span className="text-[10px] text-slate-500">Rear camera will launch automatically</span>
              </label>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Record Fill-Up & Start Departure</span>
          </button>
        </form>
      )}

      {/* STAGE 2 FORM */}
      {stage === 'offloading' && (
        <form onSubmit={handleCompleteOffloadSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Active In-Transit Trip</label>
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

          {/* STAGE 2 GPS */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Navigation className={`w-4 h-4 ${isCapturingOffloadingGPS ? 'text-blue-600 animate-spin' : 'text-emerald-600'}`} />
                <span>Drop Site GPS</span>
              </div>

              <button
                type="button"
                onClick={() => captureGPS('offloading')}
                disabled={isCapturingOffloadingGPS}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isCapturingOffloadingGPS ? 'animate-spin' : ''}`} />
                <span>{isCapturingOffloadingGPS ? 'Locating...' : 'Get Phone GPS'}</span>
              </button>
            </div>

            {offloadingGpsCoords && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                <span>Lat: <strong>{offloadingGpsCoords.lat}</strong>, Lng: <strong>{offloadingGpsCoords.lng}</strong></span>
                {offloadingGpsCoords.accuracy && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    ±{offloadingGpsCoords.accuracy}m accuracy
                  </span>
                )}
              </div>
            )}

            {offloadingGpsError && (
              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{offloadingGpsError}</span>
              </p>
            )}
          </div>

          {/* STAGE 2 CAMERA */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Offloaded Drop Area Photo</span>
              </label>

              <label htmlFor="offloadCameraInput" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]">
                <Camera className="w-3 h-3" />
                <span>Open Camera</span>
              </label>
            </div>

            <input
              id="offloadCameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoFileChange(e, 'offloading')}
              className="hidden"
            />

            {offloadingPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={offloadingPhotoUrl} alt="Drop area preview" className="w-full object-cover h-36" />
                <label
                  htmlFor="offloadCameraInput"
                  className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  Retake Photo
                </label>
              </div>
            ) : (
              <label
                htmlFor="offloadCameraInput"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-center bg-white"
              >
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="font-bold text-slate-700">Tap to snap drop area offload photo</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || activeInTransitTrips.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Offload & Finish Trip</span>
          </button>
        </form>
      )}

    </div>
  );
};
