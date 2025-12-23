# Phase 06: Deployment

**Status**: Pending | **Effort**: 6-8 hours | **Priority**: High

## Objective

Deploy Next.js GastroPay frontend with wildcard subdomain support. Configure DNS, SSL, and production environment.

## Prerequisites

- All previous phases completed
- Domain: `gastropay.cz` (or test domain)
- Hosting options: Vercel, VPS, or Docker

## Deployment Options

### Option A: Vercel (Recommended for MVP)

Vercel natively supports Next.js with wildcard subdomains on Pro plan.

### Option B: VPS with Docker + Nginx

Self-hosted with more control, required for production scale.

## Tasks

### 6.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd gastropay
vercel --prod
```

**vercel.json Configuration:**

```json
{
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "POS_API_URL": "@pos_api_url",
    "COMGATE_MERCHANT_ID": "@comgate_merchant_id",
    "COMGATE_SECRET": "@comgate_secret",
    "COMGATE_TEST_MODE": "@comgate_test_mode"
  },
  "rewrites": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "(?<subdomain>[^.]+).gastropay.cz"
        }
      ],
      "destination": "/:path*"
    }
  ]
}
```

### 6.2 DNS Configuration

```
; A records
gastropay.cz.        A     76.76.21.21     ; Vercel IP
*.gastropay.cz.      A     76.76.21.21     ; Wildcard subdomain

; Or for VPS
gastropay.cz.        A     YOUR_VPS_IP
*.gastropay.cz.      A     YOUR_VPS_IP

; CNAME for Vercel
gastropay.cz.        CNAME  cname.vercel-dns.com.
```

### 6.3 VPS Docker Setup

**Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm i -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  gastropay:
    build: .
    container_name: gastropay-web
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - POS_API_URL=${POS_API_URL}
      - COMGATE_MERCHANT_ID=${COMGATE_MERCHANT_ID}
      - COMGATE_SECRET=${COMGATE_SECRET}
      - COMGATE_TEST_MODE=${COMGATE_TEST_MODE}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 6.4 Nginx Configuration (Wildcard SSL)

```nginx
# /etc/nginx/sites-available/gastropay

# Rate limiting
limit_req_zone $binary_remote_addr zone=gastropay:10m rate=10r/s;

# Upstream
upstream gastropay_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP redirect
server {
    listen 80;
    server_name gastropay.cz *.gastropay.cz;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name gastropay.cz *.gastropay.cz;

    # Wildcard SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/gastropay.cz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gastropay.cz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # Rate limiting
    limit_req zone=gastropay burst=20 nodelay;

    # Next.js static files
    location /_next/static {
        proxy_pass http://gastropay_app;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public assets
    location /public {
        proxy_pass http://gastropay_app;
        add_header Cache-Control "public, max-age=86400";
    }

    # API routes
    location /api {
        proxy_pass http://gastropay_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # All other routes
    location / {
        proxy_pass http://gastropay_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.5 Wildcard SSL with Certbot

```bash
# Install Certbot with Cloudflare DNS plugin (for wildcard)
sudo apt install certbot python3-certbot-dns-cloudflare

# Create Cloudflare credentials file
sudo mkdir -p /etc/letsencrypt
cat <<EOF | sudo tee /etc/letsencrypt/cloudflare.ini
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
EOF
sudo chmod 600 /etc/letsencrypt/cloudflare.ini

# Request wildcard certificate
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d gastropay.cz \
  -d "*.gastropay.cz"

# Auto-renewal
sudo certbot renew --dry-run
```

### 6.6 Environment Variables

```bash
# .env.production
NODE_ENV=production

# POS API
POS_API_URL=https://api.gokasa.cz
POS_API_TIMEOUT=10000

# Comgate
COMGATE_MERCHANT_ID=12345
COMGATE_SECRET=your-production-secret
COMGATE_TEST_MODE=false

# App URLs
NEXT_PUBLIC_APP_URL=https://gastropay.cz
NEXT_PUBLIC_DEFAULT_LOCALE=cs
```

### 6.7 Next.js Production Config

```typescript
// next.config.ts (production additions)
const nextConfig = {
  output: "standalone", // Required for Docker

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.gokasa.cz" },
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Compression
  compress: true,

  // Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
}
```

### 6.8 Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  })
}
```

### 6.9 Deploy Script (VPS)

```bash
#!/bin/bash
# scripts/deploy.sh
set -e

PROJECT_DIR="/home/deploy/gastropay"

echo "=== GastroPay Deployment ==="

cd $PROJECT_DIR

# Pull latest
echo "Pulling latest code..."
git pull origin main

# Build and restart
echo "Building Docker image..."
docker compose build --no-cache

echo "Restarting services..."
docker compose down
docker compose up -d

# Health check
echo "Waiting for health check..."
sleep 10
curl -f http://localhost:3000/api/health || exit 1

echo "=== Deployment complete ==="
docker compose ps
```

### 6.10 Monitoring Setup

```bash
# Install PM2 for monitoring (alternative to Docker)
npm i -g pm2

# Start with PM2
pm2 start npm --name "gastropay" -- start

# Monitor
pm2 monit

# Save process list
pm2 save
pm2 startup
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Environment variables set
- [ ] Domain DNS configured
- [ ] POS API accessible from production

### Vercel Deployment
- [ ] Connect Git repository
- [ ] Configure environment variables
- [ ] Add custom domain
- [ ] Configure wildcard subdomain (Pro plan)
- [ ] Enable HTTPS

### VPS Deployment
- [ ] VPS provisioned (Ubuntu 22.04)
- [ ] Docker installed
- [ ] Nginx installed
- [ ] SSL certificate obtained
- [ ] Firewall configured
- [ ] Docker containers running
- [ ] Nginx configured

### Post-Deployment
- [ ] Health check passes
- [ ] Landing page loads (`gastropay.cz`)
- [ ] Subdomain works (`test.gastropay.cz`)
- [ ] i18n works (`/en/`, `/vi/`)
- [ ] POS API integration works
- [ ] Comgate payment flow works
- [ ] Webhook receives callbacks

## Security Notes

- All env vars in secure storage
- HTTPS enforced everywhere
- Rate limiting configured
- Security headers set
- MongoDB only on localhost (if used)
- Comgate webhook IP whitelist

## Monitoring

- Health endpoint: `/api/health`
- Vercel Analytics (built-in)
- Optional: Sentry for error tracking
- Optional: UptimeRobot for availability

## Unresolved Questions

1. CDN for static assets (Cloudflare)?
2. Staging environment needed?
3. Automated CI/CD pipeline?
4. Log aggregation service?
5. Backup strategy for session data?

## Cost Estimates

| Service | Free Tier | Production |
|---------|-----------|------------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| VPS (Hetzner) | - | ~10 EUR/mo |
| Domain | - | ~10 EUR/yr |
| SSL | Let's Encrypt | Free |
| Comgate | 3 months free | 0-1% per tx |
