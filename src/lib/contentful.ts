import { createClient } from "contentful";

const client = createClient({
	space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
	accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN!,
	environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master",
});

export default client;
