import { NextRequest, NextResponse } from "next/server";
import { createClient } from "contentful";
import { Asset } from "contentful";

type VinylRecordFields = {
	title: string;
	artistName: string[];
	releaseYear: number;
	genre: string[];
	label: string;
	price: number;
	catalogueNumber: string;
	vinylCondition: string;
	sleeveCondition: string;
	description: Document;
	coverImage: Asset;
};

const client = createClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export async function GET(req: NextRequest) {
	const id = req.nextUrl.searchParams.get("id");
	if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

	try {
		const entry = await client.getEntry(id);
		const fields = entry.fields as unknown as VinylRecordFields;
		const coverImage = fields.coverImage as Asset;
		const coverImageUrl = coverImage?.fields?.file?.url
			? `https:${coverImage.fields.file.url}`
			: undefined;

		const record = {
			id: entry.sys.id,
			title: fields.title,
			artistName: fields.artistName,
			releaseYear: fields.releaseYear,
			genre: fields.genre,
			label: fields.label,
			price: fields.price,
			catalogueNumber: fields.catalogueNumber,
			vinylCondition: fields.vinylCondition,
			sleeveCondition: fields.sleeveCondition,
			description: fields.description,
			coverImageUrl,
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
