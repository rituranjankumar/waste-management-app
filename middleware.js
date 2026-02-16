import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  console.log("MIDDLEWARE HIT ->", req.nextUrl.pathname);
  const token = await getToken({
  req,
  secret: process.env.NEXTAUTH_SECRET,
});

  console.log("Tooken in the midddleware is -> ",token);
   console.log("url ",req?.url);
   console.log("path name is -> ",req?.nextUrl?.pathname)
  const { pathname } = req.nextUrl;

  if (req.nextUrl.pathname.startsWith("/api/auth")) {
  return NextResponse.next();
}

  //  Role based dashboard
  const getDashboardPath = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "worker") return "/worker/dashboard";
    return "/user/dashboard";
  };

     // LOGGED IN user trying to access /login or /signup -> redirect to dashboard
  const isAuthPage = pathname === "/login" || pathname === "/signup";

   if (token && isAuthPage) {
    return NextResponse.redirect(new URL(getDashboardPath(token.role), req.url));
  }
 

  // Public routes
  if (
    pathname == ("/login") ||
    pathname == ("/signup") ||
    pathname == ("/aboutus") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }
  
  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  //user should not access complete profile without the signup
  



  // Logged in but profile incomplete
   if (!token?.isProfileCompleted) {
    if (pathname !== "/complete-profile") {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    return NextResponse.next();
  }


 
  //  If profile is completed, stop user from going to /complete-profile
  if (token?.isProfileCompleted && pathname === "/complete-profile") {
    return NextResponse.redirect(new URL(getDashboardPath(token.role), req.url));
  }

  // Role based route protection
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL(getDashboardPath(token.role), req.url));
  }

  if (pathname.startsWith("/worker") && token.role !== "worker") {
    return NextResponse.redirect(new URL(getDashboardPath(token.role), req.url));
  }

  if (pathname.startsWith("/user") && token.role !== "user") {
    return NextResponse.redirect(new URL(getDashboardPath(token.role), req.url));
  }

  return NextResponse.next();
}

// excclude the api from the middleware 
// api protection will be done on the backend
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
