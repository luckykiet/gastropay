# SEO-Friendly Restaurant Ordering Frontend
## GastroPay Architecture Research

**Date**: 2025-12-13 | **Status**: Complete | **Focus**: SSR/SSG, Multi-language SEO, Subdomain Strategy

---

## Executive Summary

**Recommendation: Next.js 15.2 with Hybrid Rendering (SSG + ISR + SSR)**

For a Czech restaurant ordering platform targeting Czech/English/Vietnamese speakers, Next.js offers the optimal balance of SEO, performance, and flexibility. Key decision: use subdirectories (`restaurant.gastropay.cz/en/`, `restaurant.gastropay.cz/de/`) instead of wildcard subdomains to maintain domain authority consolidation.

---

## 1. Rendering Strategy Analysis

### SSG (Static Site Generation) - Recommended for 90% of Content
- **Best for**: Static menu pages, restaurant info, landing pages
- **Benefit**: Pre-rendered HTML, CDN-cached, sub-100ms load times
- **SEO**: Crawlable without JavaScript; perfect for indexing
- **Build time**: One-time at deploy; reusable forever

### ISR (Incremental Static Regeneration) - Best for Dynamic Menus
- **Use case**: Daily specials, seasonal items, availability updates
- **Benefit**: Updates pages without full rebuild; revalidate on-demand
- **Timing**: Cache for 3600s (1 hour), then regenerate in background
- **Result**: Fresh content + fast delivery

### SSR (Server-Side Rendering) - For Real-Time Data
- **Limited use**: Real-time reservations, user dashboards, order tracking
- **Trade-off**: Slower than SSG/ISR but dynamic per-request
- **Performance**: Implement streaming to avoid blocking page renders

### Hybrid Architecture Recommendation
```
- SSG: Restaurant info, menus (static content)
- ISR: Specials board, promotions (updates daily)
- SSR: Order status, user authentication flows
```

---

## 2. Multi-Language SEO Strategy (Czech/English/Vietnamese)

### URL Structure: Subdirectories Over Subdomains
**CRITICAL**: Avoid wildcard subdomains (`en.restaurant.cz`) for language targeting.

**Recommended Structure**:
```
restaurant.gastropay.cz/        (Czech - default)
restaurant.gastropay.cz/en/     (English)
restaurant.gastropay.cz/vi/     (Vietnamese)
```

**Why Subdirectories Win**:
- Single domain authority consolidation (all SEO power flows to primary domain)
- Easier crawl budget management
- Hreflang implementation simpler
- Avoids treating languages as separate sites (common crawler mistake)

### Hreflang Implementation
Add to every page's `<head>`:
```html
<link rel="alternate" hreflang="cs" href="https://restaurant.gastropay.cz/" />
<link rel="alternate" hreflang="en" href="https://restaurant.gastropay.cz/en/" />
<link rel="alternate" hreflang="vi" href="https://restaurant.gastropay.cz/vi/" />
<link rel="alternate" hreflang="x-default" href="https://restaurant.gastropay.cz/" />
```

### Next.js i18n Implementation
Use next-intl or i18nexus for dynamic routing:
```typescript
// pages structure
/[locale]/menu/
/[locale]/order/
/[locale]/restaurant-info/
```

---

## 3. Structured Data (Schema.org JSON-LD)

### Core: Restaurant + Menu Schema
Every restaurant page MUST include:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://restaurant.gastropay.cz/#restaurant",
  "name": "Restaurant Name",
  "image": "https://...",
  "description": "Brief description",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Street",
    "addressLocality": "Prague",
    "addressRegion": "CZ",
    "postalCode": "110 00",
    "addressCountry": "CZ"
  },
  "telephone": "+420 XXX XXX XXX",
  "url": "https://restaurant.gastropay.cz",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Monday",
      "opens": "11:00",
      "closes": "22:00"
    }
  ],
  "servesCuisine": "Czech",
  "priceRange": "$$",
  "hasMenu": "https://restaurant.gastropay.cz/menu",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "250"
  }
}
```

### Menu Schema (within Restaurant page)
```json
{
  "@type": "Menu",
  "name": "Main Menu",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Starters",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Goulash Soup",
          "description": "Traditional Czech soup",
          "offers": {
            "@type": "Offer",
            "price": "150",
            "priceCurrency": "CZK"
          }
        }
      ]
    }
  ]
}
```

### Validation
- Use Google's Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org

---

## 4. Core Web Vitals Performance Checklist

### Largest Contentful Paint (LCP) < 2.5s
- Use Next.js `<Image />` component (auto-optimization, lazy-loading)
- Preload critical resources: `<link rel="preload" as="image" href="..." />`
- Avoid large unstyled fonts; use `font-display: swap`

### First Input Delay (FID) < 100ms
- Code-split with dynamic imports: `dynamic(() => import('Component'), { ssr: false })`
- Defer non-critical JavaScript
- Use React Server Components (RSC) in Next.js 15 for reduced payload

### Cumulative Layout Shift (CLS) < 0.1
- Reserve space for images (use explicit aspect ratios)
- Avoid injecting content into DOM dynamically
- Load fonts early with `preload`

### Implementation in Next.js
```typescript
// next.config.js
module.exports = {
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@ui/components'],
  }
}
```

---

## 5. Subdomain Handling for Wildcard (restaurant.gastropay.cz)

### Don't Use Wildcard for Languages
Instead, implement dynamic routing:

```typescript
// Next.js App Router
/app/[locale]/restaurant/[slug]/page.tsx
// Generates: /en/restaurant/czech-pub-prague/
```

### Wildcard SLD (Second-Level Domain) for Multi-Tenant
If using `{restaurant}.gastropay.cz` for different restaurants:

**Challenges**:
- Each subdomain = separate SSL cert (use wildcard cert: `*.gastropay.cz`)
- Search engines may treat as separate properties (requires Search Console setup per domain)
- Link building & authority not consolidated

**Solution**:
- Use one Search Console property for `*.gastropay.cz`
- Add `rel="canonical"` pointing to main domain when needed
- Implement robots.txt to prevent duplicate indexing
- Use shared analytics/tracking across subdomains

---

## 6. Tech Stack Decision Matrix

| Criteria | Next.js 15.2 | React SPA (Vite) | Astro |
|----------|-------------|------------------|-------|
| SSR/SSG | ✅ Native | ❌ Not built-in | ✅ Strong |
| i18n | ✅ next-intl | ⚠️ Manual | ✅ Good |
| Performance | ✅ Excellent | ❌ CSR penalty | ✅ Excellent |
| Learning Curve | ⚠️ Moderate | ✅ Simple | ⚠️ Moderate |
| Production Menus | ✅ ISR ideal | ❌ Stale | ✅ Good |

**Verdict**: **Next.js 15.2** is optimal for restaurant menus + SEO needs.

---

## 7. Implementation Roadmap

### Phase 1: Foundation
- [ ] Setup Next.js 15.2 with App Router
- [ ] Install `next-intl` for i18n routing
- [ ] Configure subdirectory-based locales
- [ ] Add hreflang meta tags

### Phase 2: SEO Infrastructure
- [ ] Implement Restaurant + Menu JSON-LD schemas
- [ ] Add `robots.txt` + `sitemap.xml` (auto-generated by Next.js)
- [ ] Setup Google Search Console property
- [ ] Configure Core Web Vitals monitoring (Web Vitals lib)

### Phase 3: Content Rendering
- [ ] SSG for static pages (menu, info, contact)
- [ ] ISR for specials/promotions (revalidate: 3600)
- [ ] Image optimization with `<Image />` + WebP/AVIF

### Phase 4: Performance Optimization
- [ ] Implement code-splitting with `dynamic()`
- [ ] Add preload/preconnect for critical resources
- [ ] Optimize fonts with `font-display: swap`
- [ ] Verify CWV metrics with PageSpeed Insights

---

## 8. Key Configuration Template (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['cs', 'en', 'vi'],
    defaultLocale: 'cs',
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
  headers: async () => [
    {
      source: '/:locale/sitemap.xml',
      headers: [{ key: 'Content-Type', value: 'application/xml' }],
    },
  ],
};

module.exports = nextConfig;
```

---

## 9. SEO Audit Checklist

- [ ] **Mobile-first design**: Test on <600px viewports
- [ ] **Page speed**: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] **Structured data**: All pages pass Rich Results Test
- [ ] **Hreflang**: Every language version correctly linked
- [ ] **Robots.txt**: Allows crawling of menu pages
- [ ] **Sitemap.xml**: Includes all locales (auto-generated by Next.js)
- [ ] **Meta tags**: Unique title (60 chars), description (160 chars) per page
- [ ] **Open Graph**: og:title, og:description, og:image for social sharing
- [ ] **Canonical tags**: Prevent duplicate content issues
- [ ] **404 handling**: Custom 404 page for crawlers

---

## 10. Tools & Monitoring

### Free Tools
- Google Search Console: Track indexing, query performance
- Lighthouse CI: Automated performance audits in CI/CD
- next-seo package: Simplify meta tag management
- Vercel Analytics: Real user monitoring (RUM) for CWV

### Recommended Setup
```bash
npm install next-seo next-intl next-sitemap web-vitals
```

---

## Unresolved Questions

1. **Restaurant-specific menu CDN caching**: Should specials invalidate only that restaurant's cache, or full rebuild?
2. **CJK character handling**: How will Vietnamese text affect LCP with Google Fonts? (Test with early preload)
3. **Multi-restaurant subdomain strategy**: Will `restaurant1.gastropay.cz` impact main domain authority? (Risk: yes; mitigation: canonical + 301s when consolidating)
4. **Local Czech SEO**: Should target "nejlepší restaurace v Praze" or focus on restaurant names? (Answer: combination with schema local results)

---

## References

- [The Complete Next.js SEO Guide](https://strapi.io/blog/nextjs-seo)
- [Next.js 15.2 Rendering Strategies](https://nextjs.org/learn/seo/rendering-strategies)
- [SSR vs. SSG Best Practices 2025](https://colorwhistle.com/ssr-ssg-trends-nextjs/)
- [International SEO Site Structure](https://delante.co/subdomain-or-folders-for-international-seo/)
- [Schema.org Restaurant Type](https://schema.org/Restaurant)
- [Google Local Business Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Multilingual SEO Guidelines](https://intlayer.org/blog/SEO-and-i18n)
