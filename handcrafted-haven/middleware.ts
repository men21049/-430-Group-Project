import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  // Simple protection for seller routes
  if (url.pathname.startsWith("/seller")) {
    console.log("🔍 MIDDLEWARE EXECUTING for:", url.pathname);
    console.log("🔍 Token exists:", !!token);
    console.log("🔍 Role:", role);
    
    if (!token) {
      console.log("🔍 NO TOKEN - redirecting to login");
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    
    if (role && role.toUpperCase() !== "SELLER" && role.toUpperCase() !== "ADMIN") {
      console.log("🔍 INVALID ROLE - redirecting to login");
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    
    console.log("🔍 ACCESS GRANTED");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/seller/:path*" // Temporarily disabled
  ],
};
