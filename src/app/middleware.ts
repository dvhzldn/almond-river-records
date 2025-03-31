import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (req.nextUrl.pathname.startsWith("/admin") && (!user || error)) {
		const redirectUrl = req.nextUrl.clone();
		redirectUrl.pathname = "/login";
		redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	return res;
}

export const config = {
	matcher: ["/admin/:path*"],
};
