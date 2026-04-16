import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function pathWithoutLocale(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  return pathname;
}

function loginPathFor(pathname: string): string {
  return pathname.startsWith("/en") ? "/en/login" : "/login";
}

function portalPathFor(pathname: string): string {
  return pathname.startsWith("/en") ? "/en/portal" : "/portal";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stripped = pathWithoutLocale(pathname);

  if (stripped.startsWith("/dashboard")) {
    if (!user) {
      const login = new URL(request.url);
      login.pathname = loginPathFor(pathname);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const portal = new URL(request.url);
      portal.pathname = portalPathFor(pathname);
      return NextResponse.redirect(portal);
    }
    return response;
  }

  if (stripped.startsWith("/portal")) {
    if (!user) {
      const login = new URL(request.url);
      login.pathname = loginPathFor(pathname);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
