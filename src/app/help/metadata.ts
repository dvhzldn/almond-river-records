import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Help & FAQs | Almond River Records",
	description:
		"Need help ordering vinyl records online? Browse FAQs about shipping, in-store sales and returns at Almond River Records.",
	openGraph: {
		title: "Help & FAQs | Almond River Records",
		description:
			"Find answers to common questions about buying second-hand vinyl records from Almond River Records in Edinburgh.",
		url: "https://almondriverrecords.online/help",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://almondriverrecords.online/images/almond-river-logo.jpg",
				width: 800,
				height: 800,
				alt: "Almond River Records logo",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Help with Your Order | Almond River Records",
		description:
			"Questions about shipping, pickup, or record conditions? Visit our Help & FAQs page for support.",
		images: [
			"https://almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://almondriverrecords.online/help",
	},
};
