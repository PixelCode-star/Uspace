# Uspace Student Housing Platform

Uspace is a fast, responsive Single-Page Application (SPA) built for Unilus students to find off-campus housing. It connects landlords directly with verified students to fill vacancies fast without zero friction.

## Architecture & Tech Stack

This project was recently migrated from a static, vanilla HTML/JS monolith to a modern modular architecture for drastically improved maintainability, speed, and real-time capability.

- **Frontend Framework**: React 18
- **Build Tool**: Vite (Lightning-fast HMR and optimized production bundling)
- **Routing**: `react-router-dom` v6
- **Database / Auth**: Supabase (PostgreSQL, Realtime, Storage)
- **Styling**: Pure semantic CSS with dynamic variable theming (Dark UI / Green Accents)
- **Iconography**: Phosphor Icons

## Local Development

The workspace includes a self-contained Node environment. 
To start the local Hot-Module Replacement (HMR) server, simply run:

```powershell
.\npm.cmd run dev
```

The application will be served at `http://localhost:5173/`. 
Any changes made inside `src/` will instantly update the browser without losing application state.

### Environment Variables
You must have a `.env.local` file at the root containing your Supabase credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment

Uspace edge-deploys its static front-end via **Bunny.net**.

To push your latest changes live to the CDN:

1. **Build the production bundle**: 
   Because Uspace uses Vite, you must compile the application before deploying.
   ```powershell
   .\npm.cmd run build
   ```
   This generates pre-rendered, optimized HTML, JS, and CSS into the `dist/` folder.

2. **Run the Deployment Script**:
   The `deploy.ps1` PowerShell script hooks directly into the Bunny.net REST API to cleanly upload the `dist/` output logic to the CDN, ensuring high caching behavior and no useless module bloat.
   
   Ensure your API keys are configured correctly inside `deploy.ps1`, then run:
   ```powershell
   .\deploy.ps1
   ```

## Database Schema (Supabase)

To view or restore the PostgreSQL schema (which includes all Tables, Types, and Row-Level Security Policies protecting the platform), see `supabase-schema.sql`.

If you ever see a `failed to upload image` error, run the **Storage Bucket Configuration** snippet located at the very bottom of the SQL file in your Supabase SQL Editor.
