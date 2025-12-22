FinTrack - Personal Finance Manager

FinTrack is a privacy-focused, offline-first personal finance application designed to simplify expense tracking and budgeting. It features an intelligent text parser that allows users to log transactions by simply pasting SMS or clipboard text, eliminating manual data entry fatigue.

🚀 Features

Smart SMS Parsing: Automatically extracts amount, merchant, and category from copied transaction texts.

Dynamic Discretionary Budget: Calculates your "Safe-to-Spend" limit by deducting fixed monthly obligations (Rent, EMI, SIP) from your income in real-time.

Offline-First & Private: All data is stored locally on your device (localStorage). No external servers, no tracking, complete privacy.

Goal Tracking: Set savings targets and get automatic calculations for monthly savings required.

Backup & Restore: Export your entire financial history to a JSON file for backup or transfer between devices.

Installable PWA: Functions as a native app on mobile devices (iOS/Android) with full offline support.

🛠️ Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS

Icons: Lucide React

State Persistence: LocalStorage API

🏁 Getting Started

Follow these steps to run the project locally on your machine.

Prerequisites

Node.js (v16 or higher) installed.

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