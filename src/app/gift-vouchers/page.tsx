import Link from "next/link";
import Image from "next/image";

export default function GiftVouchers() {
	return (
		<div className="page-container">
			<h1 className="page-title">Gift Vouchers</h1>

			<div className="content-box">
				<section
					className="two-column-layout"
					aria-labelledby="gift-vouchers-heading"
				>
					<div className="text-container">
						<h2 id="gift-vouchers-heading">Our Gift Vouchers</h2>

						<p className="text">
							Almond River Records gift vouchers can be purchased over
							the counter at{" "}
							<Link href="/shop" className="hyperLink">
								our shop in Edinburgh
							</Link>
							.
						</p>

						<p className="text">
							A voucher can be used towards the purchase of any items
							bought in the store and they are valid for{" "}
							<strong>18 months</strong> from the date of purchase.
						</p>
					</div>

					<div className="image-container">
						<figure>
							<Image
								src="/images/gift-voucher.jpg"
								alt="A printed Almond River Records gift voucher"
								width={400}
								height={400}
								className="responsive-image"
								sizes="(max-width: 768px) 100vw, 250px"
								quality={60}
								loading="lazy"
							/>
							<figcaption className="sr-only">
								A sample Almond River Records gift voucher, available
								in-store.
							</figcaption>
						</figure>
					</div>
				</section>
			</div>
		</div>
	);
}
