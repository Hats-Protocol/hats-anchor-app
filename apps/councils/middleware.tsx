import { NextRequest, NextResponse } from 'next/server';

const DISABLE_POSTHOG = process.env.DISABLE_POSTHOG ? process.env.DISABLE_POSTHOG === 'true' : true;

// Valid pages that can appear after /councils/[slug]/
const VALID_PAGES = ['transactions', 'join', 'manage', 'members', 'dev', 'assets'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle PostHog ingestion
  if (pathname.startsWith('/ingest/')) {
    const url = request.nextUrl.clone();
    const hostname = url.pathname.startsWith('/ingest/static/') ? 'us-assets.i.posthog.com' : 'us.i.posthog.com';
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('host', hostname);

    url.protocol = 'https';
    url.hostname = hostname;
    url.port = '443';
    url.pathname = url.pathname.replace(/^\/ingest/, '');

    return NextResponse.rewrite(url, {
      headers: requestHeaders,
    });
  }

  // Handle councils routing
  if (pathname.startsWith('/councils/')) {
    // Match pattern: /councils/{slug}/{page}/{extra}
    const parts = pathname.split('/').filter(Boolean);

    // We need at least councils/[slug]/[page]
    if (parts.length <= 3) {
      return NextResponse.next();
    }

    const [_, slug, basePath, ...extraSegments] = parts;

    console.log({
      pathname,
      parts,
      slug,
      basePath,
      extraSegments,
      isValidPage: VALID_PAGES.includes(basePath),
    });

    // If we have a valid base page and extra segments, redirect to the base page
    if (VALID_PAGES.includes(basePath) && extraSegments.length > 0) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/councils/${slug}/${basePath}`;

      const response = NextResponse.redirect(redirectUrl, { status: 307 });

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // If the base path isn't valid, let Next.js handle the 404
    // This will use the default or custom 404 page
    if (!VALID_PAGES.includes(basePath)) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: ['/ingest/:path*', '/councils/:path*'],
};
