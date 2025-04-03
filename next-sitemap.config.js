/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: "https://almondriverrecords.online",
	generateRobotsTxt: true,
	exclude: ["/basket", "/admin", "/login"], // optional: exclude any private/non-indexable pages
	robotsTxtOptions: {
		policies: [
			{ userAgent: "*", allow: "/" },
			{ userAgent: "*", disallow: ["/basket", "/admin", "/login"] },
		],
	},
};
