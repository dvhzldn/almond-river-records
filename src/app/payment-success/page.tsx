// app/payment-success/page.tsx
import Image from "next/image";

export default function PaymentSuccess({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) {
	const checkoutId = searchParams.checkout_id;
	const title = searchParams.title;
	const artist = searchParams.artist;
	const coverImage = searchParams.coverImage;

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
