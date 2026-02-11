/**
 * Middleware - Handles i18n routing and subdomain detection
 */

import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except API routes, static files, etc.
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - Static files (images, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
