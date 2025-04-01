import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: [
			"@fortawesome/react-fontawesome",
			"@fortawesome/free-solid-svg-icons",
			"@contentful/rich-text-react-renderer",
			"@supabase/supabase-js",
		],
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.ctfassets.net" },
			{ protocol: "http", hostname: "images.ctfassets.net" },
			{ protocol: "https", hostname: "images.contentful.com" },
		],
	},
};

export default withAnalyzer(nextConfig);
