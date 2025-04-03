import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Us | Almond River Records",
	description:
		"Get in touch with Almond River Records. Visit our vinyl shop in Corstorphine, Edinburgh or drop us a message.",
	openGraph: {
		title: "Contact Us | Almond River Records",
		description:
			"Need help or want to ask about a record? Contact Almond River Records in Corstorphine, Edinburgh.",
		url: "https://almondriverrecords.online/contact",
		siteName: "Almond River Records",
		images: [
			{
				url: "https://almondriverrecords.online/images/shop-front.webp",
				width: 800,
				height: 600,
				alt: "Front of Almond River Records shop in Edinburgh",
			},
		],
		locale: "en_GB",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Almond River Records",
		description:
			"Message or visit Almond River Records – your second-hand vinyl specialists in Corstorphine, Edinburgh.",
		images: ["https://almondriverrecords.online/images/shop-front.webp"],
	},
	alternates: {
		canonical: "https://almondriverrecords.online/contact",
	},
};
