import { NextResponse } from "next/server";
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";

// Extend Contentful Entry Type to Include `contentTypeId`
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	// Extract filters from query params
	const searchQuery = searchParams.get("search") || "";
	const priceMin = searchParams.get("priceMin")
		? Number(searchParams.get("priceMin"))
		: null;
	const priceMax = searchParams.get("priceMax")
		? Number(searchParams.get("priceMax"))
		: null;
	const condition = searchParams.get("condition") || "";

	try {
		// Fetch records from Contentful
		const res = (await client.getEntries({
			content_type: "vinylRecord",
		})) as unknown as { items: VinylRecordEntry[] };

		// Map data properly
		let records = res.items.map((record) => {
			const fields = record.fields as IVinylRecordFields;
			return {
				id: record.sys.id,
				title: fields.title ?? "Unknown Title",
				artistName: fields.artistName ?? [],
				label: fields.label ?? "Unknown Label",
				price: fields.price ?? 0,
				vinylCondition: fields.vinylCondition ?? "Unknown Condition",
				sleeveCondition: fields.sleeveCondition ?? "Unknown Condition",
				inStock: fields.inStock ?? false,
				coverImage: fields.coverImage?.fields.file?.url
					? `https:${fields.coverImage.fields.file.url}`
					: null,
			};
		});

		// Apply search filter
		if (searchQuery) {
			records = records.filter(
				(record) =>
					record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					record.artistName.some((artist: string) =>
						artist.toLowerCase().includes(searchQuery.toLowerCase())
					)
			);
		}

		// Apply price filter
		if (priceMin !== null) {
			records = records.filter((record) => record.price >= priceMin);
		}
		if (priceMax !== null) {
			records = records.filter((record) => record.price <= priceMax);
		}

		// Apply condition filter
		if (condition) {
			records = records.filter(
				(record) => record.vinylCondition === condition
			);
		}

		return NextResponse.json({ records });
	} catch (error) {
		console.error("Error fetching records:", error);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
