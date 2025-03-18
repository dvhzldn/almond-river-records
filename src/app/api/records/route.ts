import { NextResponse } from "next/server";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";

// Extend Contentful Entry Type to Include `contentTypeId`
type VinylRecordEntry = {
	sys: {
		id: string;
		contentTypeId: string;
	};
	// We'll cast this field later.
	fields: unknown;
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
	const artist = searchParams.get("artist") || "";

	// Extract pagination parameters (default: limit 20, skip 0)
	const limitParam = searchParams.get("limit")
		? Number(searchParams.get("limit"))
		: 12;
	const skipParam = searchParams.get("skip")
		? Number(searchParams.get("skip"))
		: 0;

	// Build query parameters for Contentful using a custom type.
	type RecordsQueryParams = {
		content_type: string;
		limit: number;
		skip: number;
		query?: string;
		"fields.price[gte]"?: number;
		"fields.price[lte]"?: number;
		"fields.vinylCondition"?: string;
		"fields.artistName[in]"?: string | string[];
	};
	const params: RecordsQueryParams = {
		content_type: "vinylRecord",
		limit: limitParam,
		skip: skipParam,
	};

	// Apply search filter via Contentful's full-text search.
	if (searchQuery) {
		params.query = searchQuery;
	}

	// Apply price filters.
	if (priceMin !== null) {
		params["fields.price[gte]"] = priceMin;
	}
	if (priceMax !== null) {
		params["fields.price[lte]"] = priceMax;
	}

	// Apply condition filter.
	if (condition) {
		params["fields.vinylCondition"] = condition;
	}

	// Apply artist filter.
	if (artist) {
		// Contentful's [in] operator can accept an array of values.
		params["fields.artistName[in]"] = [artist];
	}

	try {
		// Fetch records from Contentful with filters and pagination
		const res = (await client.getEntries(params)) as unknown as {
			items: VinylRecordEntry[];
		};

		// Map data properly, casting fields via unknown to satisfy our type.
		const records = res.items.map((record) => {
			const fields = record.fields as unknown as IVinylRecordFields;
			return {
				id: record.sys.id,
				title: fields.title ?? "Unknown Title",
				artistName: fields.artistName ?? [],
				label: fields.label ?? "Unknown Label",
				price: fields.price ?? 0,
				vinylCondition: fields.vinylCondition ?? "Unknown Condition",
				sleeveCondition: fields.sleeveCondition ?? "Unknown Condition",
				inStock: fields.inStock ?? false,
				releaseYear: fields.releaseYear ?? null,
				coverImage: fields.coverImage?.fields.file?.url
					? `https:${fields.coverImage.fields.file.url}`
					: null,
			};
		});

		return NextResponse.json({ records });
	} catch (error) {
		console.error("Error fetching records:", error);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
