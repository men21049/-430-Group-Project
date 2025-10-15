import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const protectedCustomer = ["/signup/customer"];
  const protectedSeller = ["/signup/seller"];

  if (!token) {
    // Redirect all protected pages to login
    if (protectedCustomer.includes(url.pathname) || protectedSeller.includes(url.pathname)) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else {
    if (protectedCustomer.includes(url.pathname) && role !== "CUSTOMER") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (protectedSeller.includes(url.pathname) && role !== "SELLER") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signup/customer", "/signup/seller"],
};
