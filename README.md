# Uspace — Student Housing Platform

> Find your next boarding house near Unilus School of Medicine. Verified listings, real reviews, no WhatsApp chaos.

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://uspace.pages.dev)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Routing | React Router v6 (HashRouter) |
| Database / Auth | Supabase (PostgreSQL + RLS + Storage) |
| Styling | Vanilla CSS — dark mode, CSS variables |
| Icons | Phosphor Icons |
| Maps | Leaflet + react-leaflet |
| Mobile | Capacitor (Android) |
| Hosting | Cloudflare Pages |

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/PixelCode-star/Uspace.git
cd Uspace
npm install
```

### 2. Environment Variables

Create a `.env.local` file at the project root (never committed):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Important:** Vite bakes these values into the bundle at build time. Missing env vars = blank page.

### 3. Start Dev Server

```bash
npm run dev
```

App runs at `http://localhost:5173/`

---

## Deployment (Cloudflare Pages)

### Option A — GitHub Auto-Deploy (Recommended)

1. Push to `main` branch
2. Cloudflare Pages auto-builds and deploys

**Required:** Add env vars in Cloudflare Pages dashboard → Settings → Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option B — Manual Upload

1. Build locally (env vars must be present in `.env.local`):
   ```bash
   npm run build
   ```
2. Upload the `dist/` folder via Cloudflare Pages → Upload assets

> The `public/_redirects` file (`/* /index.html 200`) ensures SPA routing works on Cloudflare.

---

## Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, AuthModal, ListingCard, etc.)
├── context/          # React Context (AuthContext)
├── hooks/            # Custom hooks
├── lib/              # Supabase client + API helpers
├── pages/            # Route-level pages (Home, Browse, Listing, Landlord, Dashboard)
└── styles/           # Global CSS design system
public/
├── _redirects        # Cloudflare Pages SPA fallback
├── favicon.png
└── logo-nobg.png
android/              # Capacitor Android project
```

---

## Database

The full PostgreSQL schema (tables, types, Row-Level Security policies) is in `supabase-schema.sql`.

To restore or inspect the schema, paste the contents into your Supabase SQL Editor.

> If image uploads fail, run the **Storage Bucket Configuration** snippet at the bottom of `supabase-schema.sql`.

---

## Android Build

```bash
npm run android:update   # build web + sync to Capacitor
```

Open `android/` in Android Studio to build the APK.
