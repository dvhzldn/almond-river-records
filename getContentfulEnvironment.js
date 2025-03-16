/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" }); // Load env variables from .env file

const contentfulManagement = require("contentful-management");

function getEnvironment() {
	const client = contentfulManagement.createClient({
		accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN,
	});
	return client
		.getSpace(process.env.CONTENTFUL_SPACE_ID)
		.then((space) =>
			space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || "master")
		);
}

module.exports = getEnvironment;
