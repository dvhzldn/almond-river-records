import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Your Basket | Almond River Records",
	description:
		"Review your selected vinyl records, check totals, and proceed securely to checkout at Almond River Records.",
	openGraph: {
		title: "Your Basket | Almond River Records",
		description:
			"You're almost there. Complete your order of second-hand vinyl records with Almond River Records, Edinburgh.",
		url: "https://almondriverrecords.online/basket",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://almondriverrecords.online/images/almond-river-logo.jpg",
				width: 600,
				height: 600,
				alt: "Almond River Records logo",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Your Basket | Almond River Records",
		description:
			"Ready to checkout? Finalise your record order at Almond River Records.",
		images: [
			"https://almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://almondriverrecords.online/basket",
	},
	robots: {
		index: false,
		follow: true,
	},
};
