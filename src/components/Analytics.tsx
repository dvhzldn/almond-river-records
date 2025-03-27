import Script from "next/script";

export default function Analytics() {
	return (
		<Script
			src="https://cloud.umami.is/script.js"
			data-website-id="f9e63c2e-879a-4560-aead-1cd7dc330e6f"
			strategy="afterInteractive"
		/>
	);
}
