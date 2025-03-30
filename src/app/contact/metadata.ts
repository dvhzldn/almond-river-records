import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Us | Almond River Records",
	description:
		"Got a question about our vinyl collection, store hours, or services? Contact Almond River Records in Edinburgh via our form, email, or phone.",
	openGraph: {
		title: "Contact Us | Almond River Records",
		description:
			"Reach out to Almond River Records for enquiries about vinyl, our shop, or selling your collection. Located in Corstorphine, Edinburgh.",
		url: "https://beta.almondriverrecords.online/contact",
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
		title: "Contact Us | Almond River Records",
		description:
			"We're happy to hear from you. Use our contact form to get in touch about records, services, or shop details.",
		images: [
			"https://beta.almondriverrecords.online/images/almond-river-logo.jpg",
		],
	},
	alternates: {
		canonical: "https://beta.almondriverrecords.online/contact",
	},
};
