import { defineMiddleware } from 'astro:middleware';

/**
 * Security headers middleware
 *
 * Cloudflare Pages only applies the _headers file to static assets (CSS, JS,
 * images). Pages served through the Worker/Function need headers set here.
 * Keep this in sync with public/_headers for static-asset coverage.
 */

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://maps.gstatic.com https://purecatamphetamine.github.io https://i.pravatar.cc",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://maps.googleapis.com https://cloudflareinsights.com",
    "frame-src https://www.google.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.loom.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(header, value);
  }

  return newResponse;
});
