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
