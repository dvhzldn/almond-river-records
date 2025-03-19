"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PaymentSuccessClient() {
	const searchParams = useSearchParams();

	const [checkoutId, setCheckoutId] = useState<string | null>(null);
	const [title, setTitle] = useState<string | null>(null);
	const [artist, setArtist] = useState<string | null>(null);
	const [coverImage, setCoverImage] = useState<string | null>(null);

	// This ensures it only runs on the client
	useEffect(() => {
		const checkoutIdParam = searchParams.get("checkout_id");
		const titleParam = searchParams.get("title");
		const artistParam = searchParams.get("artist");
		const coverImageParam = searchParams.get("coverImage");

		setCheckoutId(checkoutIdParam);
		setTitle(titleParam);
		setArtist(artistParam);
		setCoverImage(coverImageParam);
	}, [searchParams]);

	return (
		<div className="page-container">
			<h1 className="page-title">Payment Successful</h1>
			<div className="content-box">
				<h2>You have successfully ordered:</h2>
				{artist && <h3>{artist}</h3>}
				{title && <h3>{title}</h3>}
				{coverImage && (
					<Image
						className="record-image"
						src={coverImage}
						alt={`Cover image for ${title}`}
						width={500}
						height={500}
					/>
				)}
				<h2>Thank you for your purchase!</h2>

				<br />
				<h4>Your order will be processed and dispatched shortly.</h4>
				<br />
				{checkoutId && <p>Checkout ID: {checkoutId}</p>}
			</div>
		</div>
	);
}
