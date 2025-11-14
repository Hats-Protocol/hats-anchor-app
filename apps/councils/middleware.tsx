import { NextRequest, NextResponse } from 'next/server';

// Valid pages that can appear after /councils/[slug]/
const VALID_PAGES = ['transactions', 'join', 'manage', 'members', 'dev', 'assets'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle councils routing
  if (pathname.startsWith('/councils/')) {
    // Match pattern: /councils/{slug}/{page}/{extra}
    const parts = pathname.split('/').filter(Boolean);

    // We need at least councils/[slug]/[page]
    if (parts.length <= 3) {
      return NextResponse.next();
    }

    const [, slug, basePath, ...extraSegments] = parts;

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
  matcher: ['/councils/:path*'],
};
