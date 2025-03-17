// /src/app/records/page.tsx
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";
import RecordsList from "@/components/RecordsList";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export default async function RecordsPage() {
	try {
		// Fetch records from Contentful
		const res = (await client.getEntries({
			content_type: "vinylRecord",
		})) as unknown as { items: VinylRecordEntry[] };

		// Ensure correct type handling
		const recordsData = res.items.map((record) => ({
			...record,
			fields: record.fields as IVinylRecordFields,
		}));

		// Render the client component and pass in the data as props
		return <RecordsList recordsData={recordsData} />;
	} catch (error) {
		console.error("Error fetching records:", error);
		return <p>Failed to load records. Please try again later.</p>;
	}
}
