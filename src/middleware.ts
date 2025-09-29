import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { normalizeError } from "@/lib/api/errors";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  try {
    await getSessionUser(request);
    return NextResponse.next();
  } catch (error) {
    const { status, body } = normalizeError(error);
    return NextResponse.json(body, { status });
  }
}

export const config = {
  matcher: ["/api/:path*", "/app/(protected)/:path*"],
};
