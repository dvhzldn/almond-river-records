type RecordItem = {
	title: string;
	artistName: string;
	price: number;
	vinylCondition: string;
	coverImageUrl: string;
};

interface Props {
	records: RecordItem[];
}

export default function RecordStructuredData({ records }: Props) {
	const structuredData = records.map((record) => ({
		"@context": "https://schema.org",
		"@type": "Product",
		name: `${record.artist} – ${record.title}`,
		image: [`https://almondriverrecords.online${record.imageUrl}`],
		description: `Condition: ${record.condition}`,
		offers: {
			"@type": "Offer",
			priceCurrency: "GBP",
			price: record.price.toFixed(2),
			availability: "https://schema.org/InStock",
			url: `https://almondriverrecords.online/records`,
		},
	}));

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(structuredData),
			}}
		/>
	);
}
