import React from "react";

const SumUpConnectButton: React.FC = () => {
	const clientId = process.env.NEXT_PUBLIC_SUMUP_CLIENT_ID;
	const redirectUri = process.env.NEXT_PUBLIC_SUMUP_REDIRECT_URI;
	const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
		redirectUri!
	)}`;

	return <a href={authUrl}>Connect with SumUp</a>;
};

export default SumUpConnectButton;
