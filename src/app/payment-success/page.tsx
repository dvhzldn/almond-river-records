// app/payment-success/page.tsx
import Image from "next/image";

export default function PaymentSuccess({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) {
	// Ensure searchParams is an object and handle undefined values
	const validSearchParams = searchParams ?? {};

	// Filter out undefined values and ensure only valid strings are passed to URLSearchParams
	const urlSearchParams = new URLSearchParams(
		Object.entries(validSearchParams)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.filter(([_, value]) => value !== undefined) // Only keep entries where value is a string
			.map(([key, value]) => [key, value as string]) // Ensure value is treated as a string
	);

	const checkoutId = urlSearchParams.get("checkout_id");
	const title = urlSearchParams.get("title");
	const artist = urlSearchParams.get("artist");
	const coverImage = urlSearchParams.get("coverImage");

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
