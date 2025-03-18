import Image from "next/image";
import client from "@/lib/contentful";
import {
	IVinylRecord,
	IVinylRecordFields,
} from "@/@types/generated/contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

interface PageProps {
	params: {
		id: string;
	};
}

// Extend the generated type by asserting that the sys property includes a contentTypeId.
type VinylRecordEntry = IVinylRecord & {
	sys: IVinylRecord["sys"] & { contentTypeId: string };
};

export default async function RecordPage({ params }: PageProps) {
	// First cast the result to unknown then to VinylRecordEntry
	const record = (await client.getEntry(
		params.id
	)) as unknown as VinylRecordEntry;

	if (!record) {
		return <div>Record not found</div>;
	}

	// Cast fields to IVinylRecordFields to ensure proper typing.
	const {
		title,
		subTitle,
		releaseYear,
		genre,
		description,
		catalogueNumber,
		// barcode,
		vinylCondition,
		sleeveCondition,
		price,
		coverImage,
	} = record.fields as IVinylRecordFields;

	return (
		<>
			<h1>{title}</h1>
			{subTitle && <h2>{subTitle}</h2>}
			{coverImage && coverImage.fields.file && (
				<Image
					className="modal-image"
					src={`https:${coverImage.fields.file.url}?w=600&h=600&fit=contain`}
					alt={title}
					width={300}
					height={300}
					style={{
						maxWidth: "100%",
						height: "auto",
						objectFit: "contain",
					}}
				/>
			)}
			<p>
				<strong>Year:</strong> {releaseYear || "N/A"}
			</p>
			<p>
				<strong>Genre:</strong> {genre || "N/A"}
			</p>
			<p>
				<strong>Catalogue Number:</strong> {catalogueNumber || "N/A"}
			</p>
			{/* <p>
				<strong>Barcode:</strong> {barcode || "N/A"}
			</p> */}
			<p>
				<strong>Vinyl Condition:</strong> {vinylCondition}
			</p>
			<p>
				<strong>Sleeve Condition:</strong> {sleeveCondition}
			</p>
			<p>
				<strong>Price:</strong> {price ? `£${price}` : "N/A"}
			</p>
			{description && (
				<div>
					<h3>Description</h3>
					{documentToReactComponents(description)}
				</div>
			)}
		</>
	);
}
