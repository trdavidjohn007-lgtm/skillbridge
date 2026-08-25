import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — no auth redirect on Netlify (JWT-only mode)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/requests/:path*",
    "/resources/:path*",
    "/leaderboard/:path*",
    "/progress/:path*",
    "/session/:path*",
    "/study-motivation/:path*",
  ],
};
