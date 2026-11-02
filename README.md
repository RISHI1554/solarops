# SolarOps - Solar Energy Installation & Billing Management System

A production-ready web application for end-to-end residential and commercial rooftop solar installation, 7-stage project progress tracking, Central Financial Assistance (PM Surya Ghar: Muft Bijli Yojana) subsidy management, flexible EMI billing, technician operations, and administrative fleet control.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Design Language**: Solar-energy visual style with warm off-white surfaces (`#FBFBFA`), deep slate typography, forest emerald and solar amber accents.
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Auth triggers, and foreign key relations).
- **Client**: Official `@supabase/supabase-js`.
- **Demo Mode**: Built-in simulated database and local state fallback. If Supabase environment variables are missing, the application automatically runs in Demo Mode with clearly labeled simulated data and interactive flows.
- **Payments**: 100% simulated sandbox payment system for UPI, Card, and NetBanking. No real financial credentials or charges are ever collected.

---

## User Roles & Configurable Admin Email

The system provides three distinct, role-based dashboards:

1. **Customer**:
   - Rooftop solar capacity and savings calculator.
   - Multi-step turnkey installation request form (roof surface, sanctioned load, DISCOM, package).
   - 7-Stage Live Installation Tracker (Survey, Approval, Delivery, Mounting, Wiring, Net-metering, Commissioning) with field engineer notes.
   - Billing & EMI schedule with due dates, payment status, and instant simulated payments.
   - PM Surya Ghar central subsidy status tracker with DBT stages.
   - Support ticket complaint manager.
   - Profile manager to update contact details and electricity connection numbers.

2. **Technician**:
   - Assigned installation jobs board with customer site details, roof type, and scheduled dates.
   - 7-Stage milestone updater with status flags (`pending`, `in_progress`, `completed`, `blocked`) and on-site engineering observation logs.
   - Assigned complaint service tickets with investigation notes and resolution tracking.

3. **Admin**:
   - Operations KPI summary cards (Customers, Requests, Installations in progress, Revenue, Pending dues, Complaints).
   - Monthly installation progress and revenue vs. dues realization charts.
   - Installation pipeline manager: schedule site visits, assign technicians, update statuses.
   - Solar package catalog management: create, edit specifications, and toggle active status.
   - Bill generator: configure custom gross costs, central subsidies, and EMI repayment tenures (1, 6, 12, 24 months).
   - PM Surya Ghar subsidy application management (update status, log bank UTR references).
   - Customer complaint desk: assign technicians and monitor SLAs.
   - 1-Click CSV data export for installations, payments, and overdue EMIs.

### Configurable Admin Email (`VITE_ADMIN_EMAIL`)

The admin email is configured via the environment variable `VITE_ADMIN_EMAIL` (defaulting to `solar.admin@example.com`).

- When a user logs in or registers with this configured email, Supabase Auth and the database trigger assign the `admin` role.
- Supabase Row Level Security (RLS) policies enforce database access so only authenticated admin accounts can execute management queries.
- For rapid testing in demo mode, the header includes a 1-click **Role Switcher** to seamlessly test Customer (Rahul Sharma), Technician (Vikram Patel), and Admin (Priya Iyer) flows.

---

## Quick Start & Supabase Setup Guide

### 1. Run in Demo Mode (No Supabase required)

The application starts immediately in Demo Mode out of the box with realistic seed data:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### 2. Connect to Supabase

To connect your own real Supabase PostgreSQL backend:

#### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a database password and region closest to your users (e.g. South Asia / Mumbai or Singapore).

#### Step 2: Set Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables in `.env`:

```env
# Your Supabase Project Settings > API
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-publishable-key"

# Configurable Admin Email
VITE_ADMIN_EMAIL="solar.admin@example.com"
```

> **Security Note**: Never expose the Supabase `service_role` key in frontend client code. Only `VITE_SUPABASE_ANON_KEY` is used.

#### Step 3: Run Database Schema & Triggers
1. In your Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Copy the entire contents of `supabase/schema.sql`.
3. Paste into the SQL editor and click **Run**.
   - This creates all 9 tables (`profiles`, `solar_packages`, `installation_requests`, `installation_stages`, `bills`, `emi_schedules`, `demo_payments`, `subsidy_applications`, `complaints`).
   - Enables Row Level Security (RLS) on all tables with strict role-based policies.
   - Creates the `handle_new_user()` trigger on `auth.users` to automatically populate profiles and detect the admin email.

#### Step 4: Run Sample Seed Data (Optional)
In the Supabase SQL Editor, run `supabase/seed.sql` to populate the 3 default solar packages (1 kW Compact, 3 kW Standard, 5 kW High-Capacity).

---

## 7-Stage Turnkey Installation Pipeline

SolarOps implements the standard 7-stage turnkey rooftop solar installation workflow:

1. **Stage 1 - Site Survey & Shadow Audit**: Structural feasibility, rooftop shadow analysis, tilt angle measurement.
2. **Stage 2 - DISCOM Grid Feasibility Approval**: State electricity board transformer capacity and sanctioned load clearance.
3. **Stage 3 - Material & Panel Delivery**: Dispatch of Tier-1 bifacial modules, smart grid-tied inverter, and hot-dip galvanized mounting structures.
4. **Stage 4 - Mounting Structure & Panel Fixing**: Elevated frame anchoring with chemical fasteners at optimal 22° south-facing tilt.
5. **Stage 5 - Wiring, Inverter & Earthing**: DCDB, ACDB, copper bonded chemical earthing rods, and surge protection.
6. **Stage 6 - Net-Metering Application & Inspection**: Joint DISCOM engineer inspection and replacement of bidirectional smart meter.
7. **Stage 7 - Final Commissioning & Grid Synchronization**: Anti-islanding safety verification, grid sync, and mobile cloud generation monitoring app pairing.

---

## Simulated Sandbox Demo Payments

All payment options in SolarOps are strictly simulated for security:

- **UPI**: Simulated dynamic QR code + mock UPI ID (`demo.customer@okhdfcbank`) with 1-click test confirmation.
- **Card**: Preset dummy test cards (e.g. RuPay Platinum Test Card `•••• 4012`, SBI Solar EasyPay `•••• 5521`).
- **Net Banking**: Test bank selection (SBI, HDFC Bank, ICICI Bank, Axis Bank, PNB).

Every simulated transaction:
1. Marks the target EMI installment as paid.
2. Logs a demo transaction with an immutable reference ID.
3. Automatically updates the contract's total paid and outstanding balance.
4. Generates a printable **GST Solar Energy Tax Invoice / Receipt** with `@media print` support.

---

## File Structure

```
├── supabase/
│   ├── schema.sql           # PostgreSQL DDL, tables, RLS policies, triggers
│   └── seed.sql             # Default packages and sample records
├── src/
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client & environment validator
│   │   └── demoData.ts      # Offline demo store with realistic seed data
│   ├── context/
│   │   └── AppContext.tsx   # Central state, auth, Supabase sync & business actions
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── RoleSwitcherBanner.tsx
│   │   │   ├── DemoPaymentModal.tsx
│   │   │   └── PaymentReceiptModal.tsx
│   │   ├── landing/
│   │   │   ├── LandingPage.tsx
│   │   │   └── SolarEstimator.tsx
│   │   ├── customer/
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── SevenStageTracker.tsx
│   │   │   ├── BillingAndEmiSchedule.tsx
│   │   │   ├── SubsidyTracker.tsx
│   │   │   ├── ComplaintManager.tsx
│   │   │   ├── CustomerProfile.tsx
│   │   │   └── InstallationRequestModal.tsx
│   │   ├── technician/
│   │   │   └── TechnicianDashboard.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── PackageManagerModal.tsx
│   │   │   └── BillGeneratorModal.tsx
│   │   └── auth/
│   │       └── AuthModal.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── metadata.json
├── package.json
└── tsconfig.json
```
#   s o l a r o p s  
 