# Phase 01: Project Setup

**Status**: Pending | **Priority**: Critical

## Objective

Bootstrap Next.js 15 project in `app/` directory alongside existing `client/` and `server/` code.

## Important: Parallel Development

This creates a NEW app, not replacing the existing code:

```text
gastropay/
├── client/           # KEEP - Existing merchant dashboard
├── server/           # KEEP - Existing merchant API
├── app/              # NEW - Next.js consumer frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── package.json      # Root - Update for workspaces
```

## Prerequisites

- Node.js 20+ LTS installed
- Yarn (existing project uses Yarn)
- Git repository initialized

## Tasks

### 1.1 Create Next.js Project in `app/` Directory

```bash
cd /Users/luckykiet/GitHub/gastropay

# Create Next.js app in 'app' subdirectory
npx create-next-app@latest app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd app
```

### 1.2 Project Structure (inside `app/`)

```text
app/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Landing (gastropay.cz)
│   │   │   └── reg/
│   │   │       └── [registerId]/
│   │   │           ├── page.tsx      # Menu page
│   │   │           └── order/
│   │   │               └── page.tsx  # Order page
│   │   ├── api/
│   │   │   └── webhook/
│   │   │       └── comgate/
│   │   │           └── route.ts      # Payment webhook
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   └── features/                 # Feature components
│   ├── lib/
│   │   ├── pos-api/                  # POS API client
│   │   ├── comgate/                  # Payment client
│   │   └── utils.ts
│   ├── hooks/
│   ├── stores/                       # Zustand stores
│   ├── types/
│   │   └── pos.ts                    # POS API types
│   └── i18n/
│       ├── request.ts
│       └── routing.ts
├── messages/
│   ├── cs.json
│   ├── en.json
│   └── vi.json
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 1.3 Install Dependencies

```bash
cd app

# Core libraries
yarn add next-intl zod

# UI - Tailwind ecosystem
yarn add tailwindcss-animate class-variance-authority clsx tailwind-merge
yarn add lucide-react

# State management
yarn add zustand

# Dev tools
yarn add -D @types/node prettier eslint-config-prettier
```

### 1.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.5 Tailwind Configuration

```typescript
// app/tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        gastropay: {
          green: "#00A859",
          light: "#E8F5E9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 1.6 Environment Variables

```bash
# app/.env.local
# POS API
POS_API_URL=https://api.gokasa.cz
POS_API_TIMEOUT=10000

# Comgate (to be configured later)
COMGATE_MERCHANT_ID=
COMGATE_SECRET=
COMGATE_TEST_MODE=true

# App
NEXT_PUBLIC_APP_URL=https://vcap.me:3000
NEXT_PUBLIC_APP_DOMAIN=vcap.me
NEXT_PUBLIC_DEFAULT_LOCALE=cs
```

### 1.7 Next.js Configuration

```typescript
// app/next.config.ts
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"] as const,
    remotePatterns: [
      { protocol: "https" as const, hostname: "**.cloudinary.com" },
      { protocol: "https" as const, hostname: "**.gokasa.cz" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
```

### 1.8 Development Scripts

Update `app/package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "dev:https": "next dev --experimental-https -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

### 1.9 Update Root Package.json (Optional Workspaces)

Add workspace configuration to root `package.json`:

```json
{
  "name": "gastropay",
  "private": true,
  "workspaces": ["client", "server", "app"],
  "scripts": {
    "dev:merchant": "cd client && yarn start",
    "dev:consumer": "cd app && yarn dev",
    "build:consumer": "cd app && yarn build"
  }
}
```

### 1.10 Git Setup

Add to `.gitignore`:

```text
# Next.js consumer app
app/.next
app/node_modules
app/.env*.local
app/certs/
```

## Acceptance Criteria

- [ ] `cd app && yarn dev` starts dev server on port 3000
- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS working (test with a colored div)
- [ ] Project structure matches spec
- [ ] Environment variables configured
- [ ] Existing `client/` and `server/` code untouched

## Output Files

- `app/package.json` with dependencies
- `app/tsconfig.json` configured
- `app/tailwind.config.ts` configured
- `app/next.config.ts` with i18n plugin
- `app/.env.local.example` template

## Next Phase

[Phase 02: POS Integration](./phase-02-pos-integration.md)
