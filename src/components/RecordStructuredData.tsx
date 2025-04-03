type RecordItem = {
	id: string;
	title: string;
	artistName: string[];
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
		name: `${record.artistName.join(" & ")} – ${record.title}`,
		image: [record.coverImageUrl],
		description: `Condition: ${record.vinylCondition}`,
		offers: {
			"@type": "Offer",
			priceCurrency: "GBP",
			price: record.price.toFixed(2),
			availability: "https://schema.org/InStock",
			url: "https://almondriverrecords.online/records",
			shippingDetails: {
				"@type": "OfferShippingDetails",
				shippingRate: {
					"@type": "MonetaryAmount",
					value: "7.00",
					currency: "GBP",
				},
				shippingDestination: {
					"@type": "DefinedRegion",
					addressCountry: "GB",
				},
			},
			hasMerchantReturnPolicy: {
				"@type": "MerchantReturnPolicy",
				applicableCountry: "GB",
				returnPolicyCategory:
					"https://schema.org/MerchantReturnFiniteReturnWindow",
				merchantReturnDays: 30,
				returnMethod: "https://schema.org/ReturnByMail",
				returnFees: "https://schema.org/FreeReturn",
			},
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
