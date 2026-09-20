-- Digital Construction Site & Fleet Management System (Phase 1 MVP)
-- Supabase PostgreSQL Database Schema

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('driver', 'supervisor', 'admin');
CREATE TYPE location_type AS ENUM ('quarry', 'processing_plant', 'construction_site', 'warehouse');
CREATE TYPE trip_status AS ENUM ('loading', 'in_transit', 'completed', 'verified');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day');
CREATE TYPE expense_category AS ENUM ('fuel_oil', 'equipment_repair', 'refreshments', 'tools_spares', 'miscellaneous');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'driver',
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type location_type NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TRIPS TABLE (Enhanced for 2-Phase Lifecycle & Telematics)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    source_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    dest_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    material VARCHAR(100) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Tons',
    
    -- Phase 1: Loading Stage
    start_odometer NUMERIC(10, 1),
    fuel_range NUMERIC(10, 1),
    loading_photo_url TEXT,
    loading_gps_lat NUMERIC(10, 6),
    loading_gps_lng NUMERIC(10, 6),
    loading_gps_address TEXT,
    source_time VARCHAR(50),

    -- Phase 2: Offloading Stage
    end_odometer NUMERIC(10, 1),
    offloading_photo_url TEXT,
    offloading_gps_lat NUMERIC(10, 6),
    offloading_gps_lng NUMERIC(10, 6),
    offloading_gps_address TEXT,
    dest_time VARCHAR(50),

    -- Telematics: Rest Time & Mileage
    rest_time_minutes NUMERIC(10, 1) DEFAULT 0,
    mileage NUMERIC(10, 2),

    -- Legacy fallback fields
    gps_lat NUMERIC(10, 6),
    gps_lng NUMERIC(10, 6),
    photo_url TEXT,

    status trip_status DEFAULT 'in_transit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    offloaded_at TIMESTAMP WITH TIME ZONE
);

-- Idempotent Column Migrations
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loading_gps_address TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS offloading_gps_address TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS source_time VARCHAR(50);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS dest_time VARCHAR(50);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rest_time_minutes NUMERIC(10, 1) DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS mileage NUMERIC(10, 2);

-- 6. FUEL LOGS TABLE
CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    odometer NUMERIC(10, 1) NOT NULL,
    litres NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. EXPENSES TABLE (Petty Cash)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category expense_category NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    bill_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status attendance_status NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Public Insert Users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Public Insert Vehicles" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public Insert Locations" ON locations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Public Insert Trips" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Trips" ON trips FOR UPDATE USING (true);

CREATE POLICY "Public Read Fuel Logs" ON fuel_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Fuel Logs" ON fuel_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Public Insert Expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public Insert Attendance" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Attendance" ON attendance FOR UPDATE USING (true);

-- SEED DATA
INSERT INTO users (id, name, role, phone) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'driver', '+91 9876543210'),
    ('22222222-2222-2222-2222-222222222222', 'Vikram Singh', 'driver', '+91 9876543211'),
    ('33333333-3333-3333-3333-333333333333', 'Amit Sharma', 'supervisor', '+91 9876543212'),
    ('44444444-4444-4444-4444-444444444444', 'Priya Patel', 'admin', '+91 9876543213')
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (id, vehicle_number, model, type, capacity) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'KA-04-TR-9021', 'Volvo FMX 440', 'Tipper Truck', '16 Tons'),
    ('a2222222-2222-2222-2222-222222222222', 'KA-04-TR-8840', 'Tata Prima 2830', 'Tipper Truck', '14 Tons')
ON CONFLICT DO NOTHING;

INSERT INTO locations (id, name, type, address) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'Quarry Site Alpha', 'quarry', 'Sector 14, Granite Ridge'),
    ('b3333333-3333-3333-3333-333333333333', 'Flyover Site C', 'construction_site', 'NH-44 Bypass Junction')
ON CONFLICT DO NOTHING;

INSERT INTO trips (
    id, driver_id, vehicle_id, source_id, dest_id, material, quantity,
    start_odometer, end_odometer, fuel_range,
    loading_photo_url, loading_gps_lat, loading_gps_lng,
    offloading_photo_url, offloading_gps_lat, offloading_gps_lng,
    status, created_at, offloaded_at
) VALUES
    (
        uuid_generate_v4(), 
        '11111111-1111-1111-1111-111111111111', 
        'a1111111-1111-1111-1111-111111111111', 
        'b1111111-1111-1111-1111-111111111111', 
        'b3333333-3333-3333-3333-333333333333', 
        'Aggregates 20mm', 15.5,
        45210.0, 45238.5, 420.0,
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80', 12.9716, 77.5946,
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80', 12.9820, 77.6045,
        'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
    );
