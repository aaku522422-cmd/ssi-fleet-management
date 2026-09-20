# Production Deployment Guide - Digital Construction Site & Fleet Management System

This guide outlines step-by-step instructions for deploying the **SSI Fleet Management System** to production using **Supabase** as the backend database and **Vercel** or **Netlify** for frontend hosting.

---

## 🗄️ Step 1: Set Up Supabase Backend

### 1.1 Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and select your Organization.
3. Enter Project Name (e.g., `ssi-fleet-management-prod`) and a secure Database Password.
4. Select your preferred Region and click **Create New Project**.

### 1.2 Execute Database Schema & Seed Data
1. Navigate to the **SQL Editor** tab in your Supabase dashboard sidebar.
2. Open the file `supabase/schema.sql` from this codebase.
3. Copy and paste the complete SQL script into the Supabase SQL Editor.
4. Click **Run** to execute the script.
   - This creates all ENUM types, tables (`users`, `vehicles`, `locations`, `trips`, `fuel_logs`, `expenses`, `attendance`), Row Level Security (RLS) policies, indexes, and initial seed data.

### 1.3 Create Storage Buckets (Optional for File Uploads)
1. Go to **Storage** in the Supabase sidebar.
2. Click **New Bucket** and name it `receipts-and-slips`.
3. Set the bucket privacy to **Public**.
4. Save the bucket.

### 1.4 Copy API Credentials
1. Navigate to **Project Settings** -> **API**.
2. Copy the following keys:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public Key** (`ey...`)

---

## 🚀 Step 2: Deploy Frontend to Vercel

Vercel is the recommended hosting platform for Next.js applications.

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option B: Deploy via GitHub / Vercel Dashboard
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Under **Environment Variables**, add:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-actual-supabase-anon-key` |

5. Click **Deploy**. Vercel will build and deploy your application automatically!

---

## 🌐 Step 3: Deploy Frontend to Netlify (Alternative)

1. Log into [Netlify](https://netlify.com) and click **Add new site** -> **Import an existing project**.
2. Connect your Git provider and select the repository.
3. Set Build Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy site**.

---

## 🔍 Step 4: Post-Deployment Verification

1. Access your deployed live URL (e.g., `https://ssi-fleet-management.vercel.app`).
2. Verify the **Role Switcher** header displays:
   - `Supabase Live` pill when environment variables are set up.
   - `Demo Mode (Mock DB)` when running without external database configuration.
3. Test Driver Trip & Fuel submissions.
4. Test Supervisor Attendance toggles & Expense submissions.
5. Check Admin Dashboard KPI cards and Master Data management tables.
