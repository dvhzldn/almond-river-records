// records/page.tsx
import { fetchVinylRecords } from "@/lib/contentful";
import { VinylRecord } from "@/lib/types";
import Link from "next/link";

export default async function RecordsPage() {
	const records: VinylRecord[] = await fetchVinylRecords();

	return (
		<section>
			<h1>Vinyl Records</h1>
			<ul>
				{records.map((record) => {
					const { fields } = record;

					return (
						<li key={record.sys.id}>
							<Link href={`/records/${record.sys.id}`}>
								{safeField(fields.title)} -{" "}
								{fields.artist && Array.isArray(fields.artist)
									? fields.artist.map((a) => a.sys.id).join(", ")
									: "Artist Unknown"}
								{" ("}
								{fields.price
									? `£${fields.price}`
									: "Price Unavailable"}
								{")"}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

const safeField = (field: unknown): string =>
	typeof field === "string" ? field : "N/A";
