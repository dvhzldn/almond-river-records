import { createClient } from "contentful-management";

export const contentfulManagementClient = createClient({
	accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN!,
});
