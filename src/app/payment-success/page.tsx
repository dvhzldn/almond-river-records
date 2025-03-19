// app/payment-success/page.tsx
import { GetServerSideProps } from "next";
import Image from "next/image";

interface PaymentSuccessProps {
	checkoutId: string | null;
	title: string | null;
	artist: string | null;
	coverImage: string | null;
}

export default function PaymentSuccess({
	checkoutId,
	title,
	artist,
	coverImage,
}: PaymentSuccessProps) {
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

// Use getServerSideProps to handle the query parameters server-side
export const getServerSideProps: GetServerSideProps = async (context) => {
	const { query } = context;

	return {
		props: {
			checkoutId: query.checkout_id || null,
			title: query.title || null,
			artist: query.artist || null,
			coverImage: query.coverImage || null,
		},
	};
};
