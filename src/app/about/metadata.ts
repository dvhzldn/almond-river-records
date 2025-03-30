import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About Us | Almond River Records",
	description:
		"The origin of Almond River Records, our location in Edinburgh, opening hours, and how to get in touch.",
	openGraph: {
		title: "About Us | Almond River Records",
		description:
			"Learn more about Almond River Records and our welcoming shop in Corstorphine, Edinburgh.",
		url: "https://beta.almondriverrecords.online/about",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://beta.almondriverrecords.online/images/shop-front.webp",
				width: 800,
				height: 600,
				alt: "Andy Barbour of Almond River Records stsanding outside the shop.",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	alternates: {
		canonical: "https://beta.almondriverrecords.online/about",
	},
};
