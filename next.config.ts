import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import TerserPlugin from "terser-webpack-plugin";

// Enable bundle analyzer
const withAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

// Next.js configuration
const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: [
			"@contentful/rich-text-react-renderer",
			"@supabase/supabase-js",
			"lucide-react",
		],
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.ctfassets.net" },
			{ protocol: "http", hostname: "images.ctfassets.net" },
			{ protocol: "https", hostname: "images.contentful.com" },
		],
	},
	webpack(config, { isServer }) {
		// Minify JavaScript for production build
		if (!isServer) {
			config.optimization.minimize = true; // Ensure minification is enabled
			config.optimization.minimizer.push(
				new TerserPlugin({
					terserOptions: {
						// compress: {
						// 	drop_console: true, // Removes console logs in production
						// },
						// mangle: true, // Mangles variable and function names
						output: {
							comments: false, // Removes comments from output
						},
					},
				})
			);
		}
		return config;
	},
};

export default withAnalyzer(nextConfig);
