import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://'));

// Server-side Supabase client (runs in Node.js server, allowing secret or anon keys safely)
const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ configured: false, message: 'Supabase not configured' }, { status: 200 });
  }

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

    return NextResponse.json({
      configured: true,
      users: uRes.data || [],
      vehicles: vRes.data || [],
      locations: lRes.data || [],
      trips: tRes.data || [],
      fuelLogs: fRes.data || [],
      expenses: eRes.data || [],
      attendance: aRes.data || []
    });
  } catch (err: any) {
    console.error('Server GET Supabase Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ configured: false, error: 'Supabase not configured' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add_trip') {
      const { error } = await supabase.from('trips').insert([payload]);
      if (error) {
        // Fallback to core columns if custom columns fail
        const corePayload = {
          driver_id: payload.driver_id,
          vehicle_id: payload.vehicle_id,
          source_id: payload.source_id,
          dest_id: payload.dest_id,
          material: payload.material,
          quantity: payload.quantity,
          unit: payload.unit || 'Tons',
          start_odometer: payload.start_odometer,
          fuel_range: payload.fuel_range,
          status: 'in_transit'
        };
        const { error: coreErr } = await supabase.from('trips').insert([corePayload]);
        if (coreErr) return NextResponse.json({ error: coreErr.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'complete_trip') {
      const { tripId, updateData } = payload;
      let error = null;

      if (tripId && tripId.length === 36 && tripId.includes('-')) {
        const res = await supabase.from('trips').update(updateData).eq('id', tripId);
        error = res.error;
      } else {
        const res = await supabase.from('trips').update(updateData).eq('status', 'in_transit');
        error = res.error;
      }

      if (error) {
        const coreUpdate = {
          end_odometer: updateData.end_odometer,
          status: 'completed',
          offloaded_at: updateData.offloaded_at
        };
        await supabase.from('trips').update(coreUpdate).eq('status', 'in_transit');
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'add_fuel_log') {
      const { error } = await supabase.from('fuel_logs').insert([payload]);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'add_expense') {
      const { error } = await supabase.from('expenses').insert([payload]);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_attendance') {
      const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'employee_id,date' });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Server POST Supabase Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
