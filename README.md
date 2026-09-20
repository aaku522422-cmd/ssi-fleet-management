# Digital Construction Site & Fleet Management System (Phase 1 MVP)

An enterprise-grade, mobile-first web application designed for digital construction site monitoring, fleet tracking, material delivery logging, site attendance, and petty cash expense management.

---

## 🚀 Key Features in Phase 1 MVP

The application features **3 distinct user personas** with tailored responsive user interfaces and real-time state synchronization:

### 🚛 Role A: Driver (Mobile-First UI)
- **Shift / Trip Logging Form**: Record vehicle ID, source quarry/plant, destination construction site, material type, and quantity (Tons/M³).
- **GPS Coordinates Capture**: Interactive button simulating location acquisition with live coordinate displays.
- **Delivery Slip / Photo Capture**: Upload or snap photos of delivery slips with instant preview.
- **Fuel Logging Form**: Enter odometer reading (km), fuel litres, total amount, and fuel pump receipt slip.
- **Recent Driver History**: View recent trip and fuel logs.

### 👷 Role B: Site Supervisor (Mobile-First UI)
- **Daily Site Attendance**: Employee list view with status toggles (`Present`, `Half Day`, `Absent`) and real-time attendance counters.
- **Site Petty Cash Logging**: Record category (`Equipment Repair`, `Fuel/Oil`, `Refreshments`, `Tools & Spares`, `Miscellaneous`), amount, vendor name, notes, and bill photo upload.
- **Site Summary Feed**: Operational overview of headcount and today's site expenditures.

### 📊 Role C: Admin (Desktop & Responsive UI)
- **Executive Daily Dashboard**: Real-time KPI metrics for **Total Trips**, **Total Quantity Moved (Tons)**, **Total Fuel Expense**, **Petty Cash Expenses**, and **Site Headcount / Attendance Rate**.
- **Material Breakdown & Analytics**: Visual progress charts showing material tonnage distribution.
- **Master Data Registry**: Management tables with search, filter, and interactive creation modals for:
  - **Users** (Drivers, Supervisors, Admins)
  - **Vehicles** (Tipper Trucks, Excavators, Concrete Mixers)
  - **Locations** (Quarries, Crusher Plants, Active Construction Sites, Warehouses)
- **Real-Time Audit Stream**: Combined live feed of all site submissions.

---

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism design system, Custom Dark Theme
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime storage support)
- **Local Fallback Layer**: In-memory & LocalStorage reactive store so the application runs 100% out-of-the-box locally without any initial database setup needed.

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **pnpm**

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd SSI_Fleet_Management
npm install
```

### Step 2: Environment Setup (Optional for Live Supabase Sync)
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

*Note: If no `.env.local` is provided, the system automatically runs in **Demo Mode** using an in-memory/LocalStorage mock database containing pre-seeded construction data.*

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Use the **Role Switcher** header at the top of the app to switch between **Driver**, **Site Supervisor**, and **Admin** views instantly!

### Step 4: Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License
MIT License. Created for SSI Digital Construction & Fleet Operations.
