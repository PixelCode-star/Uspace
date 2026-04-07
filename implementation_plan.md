# Uspace — Student Housing Marketplace

A multi-page, Airbnb-style student housing discovery platform for Unilus School of Medicine students in Silverest, Zambia. Built with pure HTML + CSS + vanilla JS — no build step, no framework struggles.

## Design Direction

- **Tagline**: *"Find your home away from home"* in Caveat (Google Fonts handwriting style)
- **Color palette**: Deep navy `#0D1B2A` + vibrant coral `#FF6B6B` + mint accent `#10B981` + warm cream `#FEFBF6`
- **Typography**: Inter (body) + Caveat (tagline/brand moments)
- **Feel**: Premium, youthful, Zambian — Airbnb discovery UX + Yango simplicity
- **Pricing shown**: Free to list (early access), with future tier messaging

---

## Proposed Changes

### Project Structure

```
C:\Users\Zaige\Desktop\Uspace\
├── index.html          (Homepage)
├── browse.html         (Search & Browse)
├── listing.html        (Listing Detail)
├── dashboard.html      (Student Dashboard)
├── landlord.html       (Landlord Dashboard)
├── css/
│   ├── style.css       (Global design system)
│   └── animations.css  (Micro-animations)
├── js/
│   ├── app.js          (Global state, auth modal, nav)
│   ├── data.js         (Mock listings — Kwacha prices, Silverest locations)
│   ├── browse.js       (Filter + search logic)
│   └── listing.js      (Gallery, reviews, hold-a-room flow)
└── assets/             (Generated images)
```

---

### CSS Layer

#### [NEW] [style.css](file:///C:/Users/Zaige/Desktop/Uspace/css/style.css)
Full design system: CSS custom properties (tokens), reset, typography scale, button variants, card component, badge styles, form inputs, navbar, footer, auth modal, responsive grid, utility classes.

#### [NEW] [animations.css](file:///C:/Users/Zaige/Desktop/Uspace/css/animations.css)
Keyframe animations for: card hover lifts, fade-in-up on scroll (IntersectionObserver), shimmer skeleton loaders, modal entrance, heart-beat on save, search bar focus glow.

---

### JavaScript Layer

#### [NEW] [data.js](file:///C:/Users/Zaige/Desktop/Uspace/js/data.js)
15–20 mock listings with realistic Zambian data: room names, landlord names, Silverest street names, prices in Kwacha (K1,200–K3,500/month), amenities (WiFi, Borehole, Solar), star ratings, review counts, distance from campus, verified status.

#### [NEW] [app.js](file:///C:/Users/Zaige/Desktop/Uspace/js/app.js)
- Global auth state (localStorage-based, simple)
- Auth modal show/hide (triggered by protected actions)
- Navbar active state + mobile hamburger menu
- Save/favourite toggle with auth gate
- Toast notification system

#### [NEW] [browse.js](file:///C:/Users/Zaige/Desktop/Uspace/js/browse.js)
- Render listing cards from `data.js`
- Filter by: price range, distance, amenities checkboxes, verified only
- Live search by name/area
- Sort by: price, rating, newest

#### [NEW] [listing.js](file:///C:/Users/Zaige/Desktop/Uspace/js/listing.js)
- Photo gallery with lightbox (arrow nav, keyboard support)
- "Hold-A-Room" button triggers auth modal if not logged in
- Star rating display + review list render
- "Write a Review" triggers auth gate

---

### Pages

#### [NEW] [index.html](file:///C:/Users/Zaige/Desktop/Uspace/index.html)
- **Navbar**: Logo (Uspace) + nav links + "List Your Space" CTA + Sign In (ghost btn)
- **Hero**: Full-width gradient/image, handwritten tagline, search bar (location + price range + "Search" btn)
- **Category Pills**: 🏠 Near Campus · 📶 WiFi Included · 💧 Borehole · ☀️ Solar Backup · 💰 Budget Picks
- **Featured Listings**: 3×2 card grid (photo, price, rating, distance, verified badge)
- **How It Works**: 3 steps (Browse → Visit → Move In) with icons
- **Trust Section**: Verified Landlords badge + Student Reviews highlight + Free to List banner
- **Footer**: Links, social, tagline

#### [NEW] [browse.html](file:///C:/Users/Zaige/Desktop/Uspace/browse.html)
- Sticky filter sidebar (desktop) / collapsible filter sheet (mobile)
- Full listing grid (all mock properties)
- Active filter chips display
- Results count + sort dropdown

#### [NEW] [listing.html](file:///C:/Users/Zaige/Desktop/Uspace/listing.html)
- Photo gallery grid (hero + 4 thumbnails)
- Title, location pill, price/month, distance badge
- Amenities icon grid
- About section + landlord card (avatar, name, verified badge, "WhatsApp Landlord" btn)
- Reviews (stars + text + date)
- Sticky booking sidebar: **"Hold a Room — K50"** button (triggers auth if not logged in), also **"Book a Viewing"** (free, also auth-gated)

#### [NEW] [dashboard.html](file:///C:/Users/Zaige/Desktop/Uspace/dashboard.html)
- Tabs: Saved Listings | My Bookings | My Reviews
- Saved listing cards (with remove option)
- Booking status chips (Pending / Confirmed)
- Auth-protected (redirects to home with auth modal if not logged in)

#### [NEW] [landlord.html](file:///C:/Users/Zaige/Desktop/Uspace/landlord.html)
- Welcome banner: "List for FREE during Early Access 🎉"
- Add New Listing form (name, description, price, photos, amenities checkboxes)
- My Listings table (title, views, enquiries, status toggle)
- Enquiries list
- Simple analytics: total views, enquiries this week

---

## Auth Flow (Deferred)

Auth is **never required** to browse. Modal triggers on:
1. Clicking "Hold a Room" or "Book a Viewing"
2. Clicking heart/save on a listing
3. Clicking "Write a Review"
4. Accessing `/dashboard.html` or `/landlord.html`

Modal has two tabs: **Sign In** | **Sign Up** — simple form, stored in localStorage for MVP.

---

## Verification Plan

### Manual Browser Testing
Open each page directly:
1. `index.html` — Verify hero renders, search bar present, listing cards load, how-it-works section shows
2. `browse.html` — Test price filter, amenity checkboxes, verify-only toggle, live search
3. `listing.html` — Test gallery click, "Hold a Room" without being logged in (should trigger auth modal), confirm modal appears
4. `dashboard.html` — Access while not logged in → redirects/shows auth modal
5. `landlord.html` — Test add listing form fields, view my listings table

### Responsive Check
Resize browser to 375px width and verify mobile layout on all pages.

### Auth Gate Check
Click "Hold a Room" on listing.html without login → auth modal must appear. Fill in sign-up form → modal closes → action proceeds.

---

## Phase 1.5 Polish (Mobile & Icons)

### Iconography Upgrade
- Remove all emojis (🏠, 📶, 💧, ☀️, etc.) across the app UI and data layer.
- Integrate **Phosphor Icons** via script tag (`<script src="https://unpkg.com/@phosphor-icons/web"></script>`).
- Implement clean, professional SVGs for navbar, pills, features, listing amenities, and trust sections.

### Mobile CSS Overhaul
- **Navbar**: Fix potential collision issues on mobile layout, ensure hamburger menu spans cleanly.
- **Grids**: Force 1-column layouts strictly below 768px (`How It Works`, `Trust Grid`, `Listing Cards`).
- **Modals**: Ensure the auth modal scales nicely to 100% width on mobile (375px max) to prevent overflow.
- **Spacing**: Tidy up haphazard margins/padding on mobile viewports so content forms a clean column.

---

## Phase 2 Backend Architecture (Proposed)

To take Uspace from a static mockup to a live, transactional platform, we will use **Supabase** (an open-source Firebase alternative based on PostgreSQL).

### Core Services
1. **Supabase Auth**: Handle real user signups (Email/Password + Magic Link for students).
2. **Supabase Postgres Database**:
   - `users`: id, email, role (student/landlord), full_name.
   - `listings`: id, landlord_id, title, explicit prices, amenities (JSON or linked table), coordinates/distance.
   - `bookings`: id, student_id, listing_id, status (pending, accepted), match_date.
   - `reviews`: id, student_id, listing_id, rating, comment.
3. **Supabase Storage**: S3-compatible buckets for landlord photo uploads (rooms, exterior).

### Implementation Steps
1. Initialize a Supabase project and grab the `API_URL` and `ANON_KEY`.
2. Connect `js/app.js` to the Supabase JS client.
3. Replace hardcoded `localStorage` logic with real `sb.auth.signUp()` / `signIn()`.
4. Replace `data.js` hardcoded JSON with a `sb.from('listings').select('*')` call on page loaders.
5. Setup Row Level Security (RLS) so landlords can only edit their own listings and students can only book for themselves.
