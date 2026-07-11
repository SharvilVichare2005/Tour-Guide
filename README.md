# LocalGuide

A Next.js app that helps you discover attractions, restaurants, and hidden gems near your location. Built with the Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Google Maps.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** for auth + database (`places`, `destinations`, `saved_places`, `profiles`)
- **Google Maps** via `@googlemaps/js-api-loader`
- **lucide-react** for icons

## Project structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (Inter font, metadata)
│   ├── page.tsx            # Redirects to /home
│   ├── globals.css         # Tailwind + base styles
│   ├── login/page.tsx      # Sign in / sign up
│   ├── home/page.tsx       # Map + categories + nearby places (server fetch)
│   ├── explore/page.tsx    # Destinations grid + search (server fetch)
│   ├── about/page.tsx      # About (static)
│   └── contact/page.tsx    # Contact form
├── components/
│   ├── Header.tsx          # Shared nav header
│   ├── LogoutButton.tsx    # Client logout
│   ├── home/               # Home page sub-components
│   │   ├── HomeClient.tsx       # Client orchestrator (state, filtering)
│   │   ├── Categories.tsx       # Category filter buttons
│   │   ├── NearbyPlaces.tsx     # Places list with filter tabs
│   │   ├── MapView.tsx          # Google Maps integration
│   │   └── PlaceDetailModal.tsx # Place detail modal (tabs + save + directions)
│   ├── explore/ExploreClient.tsx
│   └── contact/ContactForm.tsx
├── lib/
│   ├── types.ts            # Place, Destination, etc.
│   ├── database.types.ts   # Supabase table types
│   ├── google-maps.ts      # Maps loader + geolocation helpers
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server Supabase client (cookies)
│       └── middleware.ts   # Session refresh + route protection
└── middleware.ts           # Protects /home, /explore, /about, /contact

public/images/              # Place + destination images
scripts/seed-database.ts    # One-off DB seed script (npm run seed)
archive/                    # Unrelated scratch files from the original repo
withdatabase/               # Original static HTML site (kept for reference)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server only, used by the seed script |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | (Optional) Map ID for Advanced Markers |

### 3. Database setup

Create these tables in Supabase (matching `src/lib/database.types.ts`):

- `places` (id uuid pk default gen_random_uuid(), name text, type text, rating numeric, image text, vicinity text, description text, location jsonb, hours text[], phone text, website text, photos text[], distance numeric)
- `destinations` (id uuid pk, title text unique, image text, description text, position jsonb)
- `saved_places` (id uuid pk, user_id uuid references auth.users, place_id uuid)
- `profiles` (id uuid pk references auth.users, username text, full_name text, avatar_url text)

Enable Row Level Security as appropriate for your app.

Seed sample data:

```bash
npm run seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run seed` | Seed the Supabase database |

## Notes

- Auth is enforced via `src/middleware.ts`: unauthenticated users hitting a protected route are redirected to `/login`; authenticated users hitting `/login` are redirected to `/home`.
- The original static HTML site lives in `withdatabase/` for reference and is excluded from the TypeScript/Next build.
- The map uses classic `google.maps.Marker`s for broad API-key compatibility; directions fall back to opening Google Maps in a new tab if routing fails or the user's location is unavailable.
