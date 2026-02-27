import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the user is visiting the home page
    if (request.nextUrl.pathname === '/') {
        const hasVisited = request.cookies.has('has_visited_welcome');

        // If they haven't visited, redirect them to the welcome page
        if (!hasVisited) {
            const url = request.nextUrl.clone();
            url.pathname = '/welcome';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Optionally, configure the middleware to run only on specific paths
export const config = {
    matcher: '/',
};
