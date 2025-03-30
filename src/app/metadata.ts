import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Almond River Records | Second-Hand Vinyl in Edinburgh",
	description:
		"Browse our curated collection of second-hand vinyl records. Shop online or visit Almond River Records in Corstorphine, Edinburgh. New stock added weekly.",
	openGraph: {
		title: "Almond River Records | Second-Hand Vinyl in Edinburgh",
		description:
			"Discover second-hand vinyl online and in-store at Almond River Records, Edinburgh. Weekly new arrivals, classic finds, and collector pieces.",
		url: "https://beta.almondriverrecords.online/",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://beta.almondriverrecords.online/images/almond-river-logo.jpg",
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
		title: "Almond River Records | Second-Hand Vinyl in Edinburgh",
		description:
			"A record shop for collectors and casual listeners alike. Browse our online store or visit us in Edinburgh.",
		images: [
			"https://beta.almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://beta.almondriverrecords.online/",
	},
};
