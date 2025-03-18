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

// Define a type for the query parameters
type RecordsQueryParams = {
	content_type: string;
	limit: number;
	skip: number;
	query?: string;
	"fields.price[gte]"?: number;
	"fields.price[lte]"?: number;
	"fields.vinylCondition"?: string;
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

	// Extract pagination parameters (default: limit 20, skip 0)
	const limitParam = searchParams.get("limit")
		? Number(searchParams.get("limit"))
		: 20;
	const skipParam = searchParams.get("skip")
		? Number(searchParams.get("skip"))
		: 0;

	// Build query parameters for Contentful using our custom type
	const params: RecordsQueryParams = {
		content_type: "vinylRecord",
		limit: limitParam,
		skip: skipParam,
	};

	// Apply search filter directly via Contentful's query parameter.
	// This performs a full-text search across searchable fields.
	if (searchQuery) {
		params.query = searchQuery;
	}

	// Apply price filters using Contentful's filtering syntax.
	if (priceMin !== null) {
		params["fields.price[gte]"] = priceMin;
	}
	if (priceMax !== null) {
		params["fields.price[lte]"] = priceMax;
	}

	// Apply condition filter
	if (condition) {
		params["fields.vinylCondition"] = condition;
	}

	try {
		// Fetch records from Contentful with filters and pagination
		const res = (await client.getEntries(params)) as unknown as {
			items: VinylRecordEntry[];
		};

		// Map data properly
		const records = res.items.map((record) => {
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

		return NextResponse.json({ records });
	} catch (error) {
		console.error("Error fetching records:", error);
		return NextResponse.json(
			{ error: "Failed to fetch records" },
			{ status: 500 }
		);
	}
}
