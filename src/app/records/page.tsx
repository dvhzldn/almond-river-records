import Link from "next/link";
import Image from "next/image";
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";

// Extend the generated type so that sys includes a contentTypeId property.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export default async function RecordsPage() {
	// Remove the generic type from getEntries and then cast the result.
	const res = (await client.getEntries({
		content_type: "vinylRecord",
	})) as unknown as { items: VinylRecordEntry[] };

	const records = res.items;

	return (
		<main style={{ padding: "1rem" }}>
			<h1>Vinyl Records</h1>
			{records.length === 0 ? (
				<p>No records found.</p>
			) : (
				<ul style={{ listStyle: "none", padding: 0 }}>
					{records.map((record) => {
						// Cast the fields property to IVinylRecordFields so properties are recognized.
						const fields = record.fields as IVinylRecordFields;
						return (
							<li
								key={record.sys.id}
								style={{
									marginBottom: "2rem",
									borderBottom: "1px solid #ccc",
									paddingBottom: "1rem",
								}}
							>
								<Link href={`/records/${record.sys.id}`}>
									<h2>{fields.title}</h2>
								</Link>
								{fields.subTitle && <p>{fields.subTitle}</p>}
								{fields.coverImage && fields.coverImage.fields.file && (
									<Image
										src={`https:${fields.coverImage.fields.file.url}`}
										alt={fields.title}
										width={200}
										height={200}
									/>
								)}
								<p>
									Price: {fields.price ? `$${fields.price}` : "N/A"}
								</p>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}
