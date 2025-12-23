# GastroPay Implementation Plan (REVISED)

**Updated**: 2025-12-23 | **Status**: Active | **Type**: Next.js + POS Integration

## Overview

GastroPay - Czech-focused QR ordering system. **This is a NEW consumer-facing frontend** that integrates with existing POS (project-ops) via `/public/gastropay/*` APIs. The existing `client/` + `server/` code is a **separate merchant management system** and will be preserved.

**Core Value**: SEO-friendly restaurant menus, multi-language support (CZ/EN/VI), Comgate payments.

## Migration Strategy

### Parallel Development (Not Replacement)
```
gastropay/
├── client/           # EXISTING - Merchant dashboard (keep as-is)
├── server/           # EXISTING - Merchant API (keep as-is)
├── app/              # NEW - Next.js consumer frontend (to be created)
├── plans/            # Implementation plans
└── package.json      # Root package.json (add workspace config)
```

**Rationale**: The existing system is a merchant management portal. The new Next.js app is a consumer-facing ordering system. They serve different purposes and can coexist.

### Deployment Strategy
- **Existing**: `gastropay.ruano.cz` (Netlify) - Merchant portal
- **New**: `gastropay.cz` (Vercel) - Consumer ordering (subdomains for companies)

## Architecture

```
gastropay.cz (landing)
{company}.gastropay.cz (store list)
{company}.gastropay.cz/reg/{id} (menu)
{company}.gastropay.cz/reg/{id}/order
{company}.gastropay.cz/en/* (English locale)
```

## Tech Stack

- **Frontend**: Next.js 15.x (stable LTS), React 18.x, App Router, next-intl, Tailwind CSS
- **State**: Zustand (cart + table sessions)
- **Rendering**: SSG (menus) + ISR (specials) + SSR (real-time)
- **Payment**: Comgate (Czech gateway) - redirect flow
- **Backend**: Uses existing POS APIs, thin webhook handler only
- **Database**: POS MongoDB via API - NO local MongoDB needed initially

## Data Flow

1. Next.js calls POS `/public/gastropay/resources?key={registerId}` (no auth, key validates register)
2. Customer builds order locally (cart stored in Zustand)
3. Submit order → `POST /public/gastropay/order` → returns `{_id, status: "received"}`
4. Create Comgate payment with `refId = registerId:orderId`
5. Redirect to Comgate → customer pays → webhook callback
6. Webhook → verify with Comgate → `POST /public/gastropay/order/status` (status: "calling")
7. Poll `GET /public/gastropay/order?key=&_id=` for real-time updates

## Revised Phases

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 01 | Project Setup | Next.js 15 in `app/` dir, Tailwind, TypeScript | Pending |
| 02 | POS Integration | API client, types, webhook handler | Pending |
| 03 | Frontend Core | i18n, layouts, SEO, wildcard subdomain | Pending |
| 04 | Customer Ordering | Menu display, cart, order flow | Pending |
| 05 | Payment | Comgate integration, webhook handling | Pending |
| 06 | Deployment | Vercel, wildcard DNS, monitoring | Pending |
| 07 | Admin Features | Deferred (use POS admin initially) | Deferred |

**Note**: Phase 07 (Admin) is **deferred** - restaurant settings can be managed in POS admin. Add GastroPay-specific settings UI only if needed later.

## Key Changes from Original Plan

1. **Location**: New app in `app/` directory, not replacing `client/`
2. **Next.js 15 (stable)**: Use Next.js 15.x stable, not 16.x (edge/experimental)
3. **React 18**: Use React 18.x stable, not 19.x
4. **No local MongoDB**: All data via POS APIs initially
5. **Admin deferred**: No `/admin` routes in MVP, use POS admin
6. **Simplified scope**: Focus on consumer ordering flow only

## Key Decisions

1. **Parallel development**: New code in `app/`, existing code untouched
2. **Next.js over React SPA**: SEO critical for restaurant discovery
3. **Subdirectories for i18n**: `/en/`, `/vi/` - domain authority consolidation
4. **POS integration**: Reuse existing models, no new backend
5. **Comgate**: Czech market standard, CZK native
6. **Polling over WebSocket**: POS doesn't support WebSocket
7. **vcap.me for dev**: Wildcard subdomain testing locally

## Live Table Feature

Customers at a table can continuously order:
1. Scan QR → Select table → Start session
2. Add items → Submit order #1 → Kitchen receives
3. Continue browsing → Add more items → Submit order #2
4. View all unpaid orders in cart drawer
5. Pay individual order OR "Pay All" to close session

**State**: `table-session.store.ts` (Zustand + localStorage persistence)

## URL Patterns

- Landing: `gastropay.cz`
- Company: `{subdomain}.gastropay.cz` → list of registers
- Store menu: `{subdomain}.gastropay.cz/reg/{registerId}`
- Order: `{subdomain}.gastropay.cz/reg/{registerId}/order`
- Locales: `/{locale}/reg/{registerId}` (cs/en/vi)

## What's NOT Changing

- `client/` - Merchant dashboard stays as React SPA on Netlify
- `server/` - Merchant API stays as Express
- `netlify.toml` - Existing deployment config
- Root `package.json` - Existing scripts (extend for workspaces)

## Dependencies

- POS API endpoints: `/public/gastropay/*` (must be available)
- POS base URL: `https://api.gokasa.cz` (or env `POS_API_URL`)
- Comgate merchant account + credentials
- Wildcard SSL cert: `*.gastropay.cz`
- DNS wildcard A record
- Cloudinary account for menu images

## Resolved Decisions

1. **Comgate webhook retry**: Adapt to Comgate's retry policy (implement idempotent handler)
2. **Order timeout**: Implement timeout handling for abandoned carts
3. **POS API rate limits**: Handle rate limits in API client
4. **Image hosting**: Use Cloudinary CDN for menu item images
