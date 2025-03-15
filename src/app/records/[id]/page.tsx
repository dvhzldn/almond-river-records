// page.tsx
import { fetchVinylRecords } from "@/lib/contentful";
import { VinylRecord } from "@/lib/types";
import type { Document } from "@contentful/rich-text-types";
import { BLOCKS, INLINES, Block, Inline } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

interface RecordDetailsPageProps {
	params: { id: string };
}

export default async function RecordDetailsPage({
	params,
}: RecordDetailsPageProps) {
	const records: VinylRecord[] = await fetchVinylRecords();
	const record = records.find((r) => r.sys.id === params.id);

	if (!record) {
		return <p>Record not found.</p>;
	}

	const { fields } = record;

	// Use type guards explicitly for rich text
	const description = fields.description as unknown as Document | undefined;
	const link = fields.link as unknown as Document | undefined;

	const safeField = (field: unknown): string =>
		typeof field === "string" ? field : "N/A";

	return (
		<section>
			<h1>{safeField(fields.title)}</h1>
			{fields.subTitle && <h2>{safeField(fields.subTitle)}</h2>}

			<p>
				<strong>Genre:</strong> {safeField(fields.genre)}
			</p>
			<p>
				<strong>Release Date:</strong> {safeField(fields.releaseDate)}
			</p>
			<p>
				<strong>Condition:</strong> Vinyl -{" "}
				{safeField(fields.vinylCondition)}, Sleeve -{" "}
				{safeField(fields.sleeveCondition)}
			</p>
			<p>
				<strong>Catalogue Number:</strong>{" "}
				{safeField(fields.catalogueNumber)}
			</p>
			<p>
				<strong>Barcode:</strong> {safeField(fields.barcode)}
			</p>
			<p>
				<strong>Price:</strong>{" "}
				{fields.price ? `£${fields.price}` : "Contact for pricing"}
			</p>

			{description && (
				<div>
					<h3>Description</h3>
					{documentToReactComponents(description, richTextOptions)}
				</div>
			)}

			{link && (
				<div>
					<h3>More Information</h3>
					{documentToReactComponents(link, richTextOptions)}
				</div>
			)}
		</section>
	);
}

const richTextOptions = {
	renderNode: {
		[BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
			<p>{children}</p>
		),
		[INLINES.HYPERLINK]: (
			node: Block | Inline,
			children: React.ReactNode
		) => {
			if (node.nodeType === INLINES.HYPERLINK) {
				return (
					<a
						href={node.data.uri}
						target="_blank"
						rel="noopener noreferrer"
					>
						{children}
					</a>
				);
			}
			return null;
		},
	},
};
