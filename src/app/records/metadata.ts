import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Browse Vinyl Records | Almond River Records",
	description:
		"Explore our wide range of second-hand vinyl records. Filter by artist, genre, decade, or condition. New arrivals added weekly at Almond River Records.",
	openGraph: {
		title: "Browse Vinyl Records | Almond River Records",
		description:
			"Dig through our growing collection of second-hand vinyl. Shop by genre, decade, or artist. Based in Corstorphine, Edinburgh.",
		url: "https://beta.almondriverrecords.online/records",
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
		title: "Browse Vinyl Records | Almond River Records",
		description:
			"Find your next vinyl gem. Discover second-hand records online or visit our Edinburgh shop.",
		images: [
			"https://beta.almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://beta.almondriverrecords.online/records",
	},
};
