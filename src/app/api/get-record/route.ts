import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful";

const client = createClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export async function GET(req: NextRequest) {
	const id = req.nextUrl.searchParams.get("id");
	if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

	try {
		const entry = await client.getEntry(id);

		const record = {
			id: entry.sys.id,
			title: entry.fields.title as string,
			artistName: entry.fields.artistName as string[],
			releaseYear: entry.fields.releaseYear.toString(),
			genre: entry.fields.genre as string[],
			label: entry.fields.label as string,
			price: entry.fields.price.toString(),
			catalogueNumber: entry.fields.catalogueNumber as string,
			vinylCondition: entry.fields.vinylCondition as string,
			sleeveCondition: entry.fields.sleeveCondition as string,
			description: entry.fields.description as string,
			coverImageUrl: entry.fields.coverImage?.fields?.file?.url
				? `https:${entry.fields.coverImage.fields.file.url}`
				: undefined,
		};

		return NextResponse.json(record);
	} catch (error) {
		console.error("Error fetching record:", error);
		return NextResponse.json(
			{ error: "Failed to fetch record" },
			{ status: 500 }
		);
	}
}
