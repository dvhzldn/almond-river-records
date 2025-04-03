import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About Us | Almond River Records",
	description:
		"The origin of Almond River Records, our location in Edinburgh, opening hours, and how to get in touch.",
	openGraph: {
		title: "About Us | Almond River Records",
		description:
			"Learn more about Almond River Records and our welcoming shop in Corstorphine, Edinburgh.",
		url: "https://almondriverrecords.online/about",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://almondriverrecords.online/images/shop-front.webp",
				width: 800,
				height: 600,
				alt: "Andy Barbour of Almond River Records outside our shop.",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	alternates: {
		canonical: "https://almondriverrecords.online/about",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Almond River Records",
		description:
			"About Almond River Records, the second-hand vinyl record shop based in Corstorphine, Edinburgh.",
		images: ["https://almondriverrecords.online/images/shop-front.webp"],
	},
};
