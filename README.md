# Traveloop

Traveloop is a React-based trip planner built with TanStack Start, Vite, Cloudflare Workers, and Prisma. It provides authenticated trip management, budgeting, packing lists, notes, and shareable trip views.

## 🚀 Tech Stack

- React 19
- Vite
- TanStack Start
- TanStack Router
- Cloudflare Workers
- Prisma + SQLite
- Tailwind CSS
- Radix UI
- TypeScript

## ✨ Key Features

- User sign up, login, logout
- Trip creation, editing, duplication, deletion
- Stop management with estimated stay, transport, and meal costs
- Activity and note support inside trips
- Packing list management
- Public trip sharing via shareable slug
- Server-side API functions using `@tanstack/react-start`
- SSR error handling wrapper in `src/server.ts`

## 📦 Prerequisites

- Node.js 20+ installed
- npm or yarn
- Cloudflare Wrangler for deployment if you want to publish to Cloudflare Workers

## 🔧 Environment

Create a `.env` file at the repo root with at least:

```env
DATABASE_URL="file:./dev.db"
```

> The Prisma datasource is configured to use SQLite via `DATABASE_URL`.

## 📁 Project Structure

- `src/` - application source code
- `src/server.ts` - Cloudflare Worker entrypoint with SSR error wrapper
- `src/lib/` - shared client/server utilities and API functions
- `prisma/schema.prisma` - database schema and Prisma client config
- `wrangler.jsonc` - Cloudflare Worker deployment config
- `vite.config.ts` - Vite config using `@lovable.dev/vite-tanstack-config`
  Traveloop
├── .lovable/
│   └── project.json
├── .tanstack/
│   └── tmp/
├── prisma/
│   ├── dev.db
│   └── schema.prisma
├── src/
│   ├── assets/
│   │   ├── city.png
│   │   ├── coastal.png
│   │   ├── hero.png
│   │   └── mountain.png
│   ├── components/
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── password-input.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   ├── app-shell.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── logo.tsx
│   │   ├── require-auth.tsx
│   │   ├── theme-toggle.tsx
│   │   └── world-map.tsx
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── city-data.ts
│   │   ├── db.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── rpc.ts
│   │   ├── store.ts
│   │   ├── use-store.ts
│   │   └── utils.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── admin.tsx
│   │   ├── dashboard.tsx
│   │   ├── explore.activities.tsx
│   │   ├── explore.cities.tsx
│   │   ├── forgot.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── profile.tsx
│   │   ├── share.$slug.tsx
│   │   ├── signup.tsx
│   │   ├── trips.$tripId.budget.tsx
│   │   ├── trips.$tripId.build.tsx
│   │   ├── trips.$tripId.index.tsx
│   │   ├── trips.$tripId.notes.tsx
│   │   ├── trips.$tripId.packing.tsx
│   │   ├── trips.$tripId.share.tsx
│   │   ├── trips.$tripId.tsx
│   │   ├── trips.index.tsx
│   │   └── trips.new.tsx
│   ├── server/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── bun.lock
├── check.js
├── components.json
├── eslint.config.js
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc


## ▶️ Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Run database migrations or create the SQLite file:

```bash
npx prisma db push
```

4. Start development server:

```bash
npm run dev
```

Then open the local URL shown by Vite.

## 🧪 Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the app for production
- `npm run build:dev` - Build using development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier

## ☁️ Cloudflare Workers Deployment

This project is configured for Cloudflare Workers via `wrangler.jsonc` and uses `src/server.ts` as the worker entry.

To publish to Cloudflare:

```bash
npx wrangler publish
```

> Make sure your Cloudflare account is authenticated and your `wrangler.toml` or `wrangler.jsonc` settings are correct.

## 🧾 Notes

- The app currently uses SQLite for local development.
- Authentication relies on a session cookie named `tl_session`.
- Server functions are defined in `src/lib/rpc.ts` and use Prisma to access app data.

## 📌 Helpful Commands

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 💡 Want to customize?

- Add new API routes in `src/lib/rpc.ts`
- Update data models in `prisma/schema.prisma`
- Modify UI layout in `src/routes/`
- Adjust worker entry behavior in `src/server.ts`

---

Created for the Traveloop application.
