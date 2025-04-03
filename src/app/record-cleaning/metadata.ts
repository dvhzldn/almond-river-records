import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Vinyl Record Cleaning Service | Almond River Records",
	description:
		"Get your vinyl records professionally cleaned in-store at Almond River Records, Corstorphine. Just £1.70 per disc.",
	openGraph: {
		title: "Vinyl Record Cleaning Service | Almond River Records",
		description:
			"Bring your records to our shop in Corstorphine, Edinburgh for a professional cleaning service. £1.70 per disc or £15 for 10.",
		url: "https://almondriverrecords.online/record-cleaning",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://almondriverrecords.online/images/record-cleaning.jpg",
				width: 800,
				height: 600,
				alt: "Close-up of a vinyl record being cleaned with professional-grade equipment",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "In-Store Record Cleaning | Almond River Records",
		description:
			"Professional vinyl record cleaning service in Corstorphine, Edinburgh. Drop in with your collection.",
		images: ["https://almondriverrecords.online/images/record-cleaning.jpg"],
	},
	alternates: {
		canonical: "https://almondriverrecords.online/record-cleaning",
	},
};
