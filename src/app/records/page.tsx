// /src/app/records/page.tsx
import client from "@/lib/contentful";
import { IVinylRecord } from "@/@types/generated/contentful";
import RecordsList from "@/components/RecordsList";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export default async function RecordsPage() {
	// Fetch records from Contentful
	const res = (await client.getEntries({
		content_type: "vinylRecord",
	})) as unknown as { items: VinylRecordEntry[] };

	const recordsData = res.items;

	// Render the client component and pass in the data as props
	return <RecordsList recordsData={recordsData} />;
}
