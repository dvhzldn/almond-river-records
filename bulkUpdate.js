/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });

const getEnvironment = require("./getContentfulEnvironment");

async function updateEntries() {
	try {
		const environment = await getEnvironment();

		// Retrieve entries for the 'vinylRecord' content type.
		const entries = await environment.getEntries({
			content_type: "vinylRecord",
		});
		console.log(`Found ${entries.items.length} entries`);

		// Loop through each entry to update the boolean fields.
		for (const entry of entries.items) {
			// Assuming the locale is 'en-GB'
			entry.fields.sold = { "en-GB": false };
			entry.fields.albumOfTheWeek = { "en-GB": false };

			// Update the entry on Contentful.
			const updatedEntry = await entry.update();
			console.log(`Updated entry ${updatedEntry.sys.id}`);

			// Publish the updated entry.
			const publishedEntry = await updatedEntry.publish();
			console.log(`Published entry ${publishedEntry.sys.id}`);
		}
	} catch (error) {
		console.error("Error updating entries:", error);
	}
}

updateEntries();
