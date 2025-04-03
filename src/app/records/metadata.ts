import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Browse Second-Hand Vinyl Records | Almond River Records",
	description:
		"Explore our full range of second-hand vinyl records, sorted by artist, genre, decade, and condition. Shipping UK-wide or pick up in Edinburgh.",
	openGraph: {
		title: "Browse Second-Hand Vinyl Records | Almond River Records",
		description:
			"Shop second-hand vinyl from artists like Bob Dylan, Genesis, and The Rolling Stones. Filter by genre, decade, and condition. Based in Edinburgh.",
		url: "https://almondriverrecords.online/records",
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
		title: "Shop Vinyl Records Online | Almond River Records",
		description:
			"Buy used vinyl online or visit our record shop in Edinburgh. Filter by artist, genre, decade, and more.",
		images: [
			"https://almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://almondriverrecords.online/records",
	},
};
