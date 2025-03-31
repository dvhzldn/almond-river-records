import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
	const secret = req.nextUrl.searchParams.get("secret");
	const path = req.nextUrl.searchParams.get("path");

	if (secret !== process.env.REVALIDATION_SECRET || !path) {
		return NextResponse.json(
			{ revalidated: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		revalidatePath(path);

		return NextResponse.json({
			revalidated: true,
			now: new Date().toISOString(),
			path,
		});
	} catch (err) {
		console.error("❌ Revalidation failed:", err);
		return NextResponse.json({ revalidated: false }, { status: 500 });
	}
}
