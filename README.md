FinTrack - Personal Finance Manager

FinTrack is a privacy-focused, cloud-synchronized personal finance application designed to simplify expense tracking and budgeting. It features secure user authentication and cloud database synchronization powered by Supabase, alongside an intelligent text parser that allows users to log transactions by simply pasting SMS or clipboard text.

🚀 Features

* **Smart SMS Parsing**: Automatically extracts amount, merchant, and category from copied transaction texts.
* **Dynamic Discretionary Budget**: Calculates your "Safe-to-Spend" limit by deducting fixed monthly obligations (Rent, EMI, SIP) from your income in real-time.
* **Cloud Sync & Security**: All transaction and obligation data is synced to your private Supabase database. Protected by Row Level Security (RLS) so that only you can view and edit your data.
* **Goal Tracking**: Set savings targets and get automatic calculations for monthly savings required.
* **Backup & Restore**: Export your entire financial history to a JSON file for backup or sync manual exports.
* **Installable PWA**: Functions as a native app on mobile devices (iOS/Android) with full offline support.

🛠️ Tech Stack

* **Frontend**: React (Vite)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Backend & Auth**: Supabase (PostgreSQL with RLS)

🏁 Getting Started

Follow these steps to run the project locally on your machine.

Prerequisites

* Node.js (v16 or higher) installed.
* A Supabase project initialized.

Database Setup

Before starting the application, run the SQL script in [schema.sql](file:///c:/Users/fatha/fintrack-beta/schema.sql) in your Supabase SQL Editor. This will create the `profiles`, `transactions`, and `obligations` tables, and set up Row Level Security (RLS) policies.

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

📄 License

This project is licensed under the MIT License.