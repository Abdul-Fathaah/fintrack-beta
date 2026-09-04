FinTrack - Personal Finance Manager for the Informal Economy

FinTrack is a privacy-first personal finance management application specifically designed for informal economy workers, cash-heavy transactions, and mobile money users. Beyond basic expense tracking, FinTrack addresses the unique financial challenges of the 1.7B unbanked adults and 2B informal workers globally through specialized features for irregular income, group savings, and offline-first functionality.

🚀 Core Differentiator
FinTrack is positioned as the first privacy-first PFM app designed specifically for cash-heavy, mobile-money-driven, and informal economy workers, leveraging strengths in SMS parsing, privacy architecture, offline capabilities, and discretionary budgeting.

🚀 Features

* **Multi-Format Transaction Parser**: Extended SMS parsing to cover mobile money (M-Pesa, GCash, Paytm Wallet), informal vendor payments, USSD responses, and voice-to-text for low-literacy users
* **Informal Savings Groups ("Village Bank")**: Track chit funds, susu/esusu, rotating savings associations, and investment clubs with group-specific features
* **Irregular Income Handling**: Daily/weekly budgeting, income smoothing, expense prioritization ("must pay" vs "can delay"), and emergency fund building for variable cash flows
* **Offline-First with Sync Optimizations**: Conflict-free replicated data types (CRDTs), selective sync, SMS-based sync options, and local AES-256 encryption for connectivity-challenged environments
* **Dynamic Discretionary Budget**: Calculates your "Safe-to-Spend" limit by deducting fixed monthly obligations from your income in real-time
* **Cloud Sync & Security**: All transaction and obligation data is synced to your private Supabase database. Protected by Row Level Security (RLS) so that only you can view and edit your data
* **Financial Education Snippets**: Contextual tips, micro-lessons, and community challenges based on user behavior
* **Backup & Restore**: Export your entire financial history to a JSON file for backup or sync manual exports
* **Installable PWA**: Functions as a native app on mobile devices (iOS/Android) with full offline support

🛠️ Tech Stack

* **Frontend**: React (Vite)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Backend & Auth**: Supabase (PostgreSQL with RLS)
* **AI Parser Service**: Enhanced transaction detection for diverse formats

🏁 Getting Started

Follow these steps to run the project locally on your machine.

Prerequisites

* Node.js (v16 or higher) installed.
* A Supabase project initialized.

Database Setup

Before starting the application, run the SQL script in [schema.sql](file:///c:/Users/fatha/fintrack-beta/schema.sql) in your Supabase SQL Editor. This will create the `profiles`, `transactions`, `obligations`, and informal savings group tables, and set up Row Level Security (RLS) policies.

Environment Config

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Installation

Clone the repository:

git clone [https://github.com/YOUR_USERNAME/fintrack-client.git](https://github.com/YOUR_USERNAME/fintrack-client.git)
cd fintrack-client


Install dependencies:

npm install


Start the development server:

npm run dev


Open the app:
Click the link shown in the terminal (usually http://localhost:5173).

📱 Mobile Installation (PWA)

To install FinTrack on your phone:

Open the hosted URL (e.g., from Vercel) in Chrome (Android) or Safari (iOS).

Android: Tap the menu (⋮) -> "Add to Home Screen" / "Install App".

iOS: Tap the Share button (⎋) -> "Add to Home Screen".

📈 Market Opportunity & Impact

* **TAM**: 3.7B potential users (1.7B unbanked + 2B informal workers)
* **Beachhead**: High mobile money penetration countries (Kenya, Ghana, Uganda, Philippines, India, Bangladesh, Vietnam)
* **Social Impact**: Addresses UN SDG 1 (No Poverty), 8 (Decent Work), 10 (Reduced Inequalities)

📄 License

This project is licensed under the MIT License.