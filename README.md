# Emerald Timer 💎

Visual Time Tracker & Life Journal. A beautiful, frameless Electron app for focus and reflection.

## ✨ Features

- **Mini Mode**: A floating, always-on-top widget for your desktop.
- **Visual Timeline**: Track your focus sessions with a beautiful interactive timeline.
- **Life Journal**: Capture moments and reflect on your productivity.
- **Smart Analytics**: View your progress by day, week, month, or year.
- **Customizable**: Set your own focus/rest intervals and category colors.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd emerald-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build for Windows:
   ```bash
   npm run build
   ```

## 📦 Releases & CI

This project uses GitHub Actions to automatically build and release the Windows installer.

To trigger a new release:
1. Update the version in `package.json`.
2. Create and push a new git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The CI will build the `.exe` and create a GitHub Release automatically.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Runtime**: Electron
- **Build Tool**: Vite, electron-builder
- **Icons**: Lucide React
- **Charts**: Recharts
