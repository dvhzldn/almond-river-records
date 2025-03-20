import Link from "next/link";
import Image from "next/image";
export default function GiftVouchers() {
	return (
		<div className="page-container">
			<h1 className="page-title">Gift Vouchers</h1>
			<div className="content-box">
				<div className="two-column-layout">
					<div className="text-container">
						<h2>Our gift vouchers</h2>
						<br />
						<p className="text">
							You can purchase Almond River Records gift vouchers over
							the counter at{" "}
							<Link href="/shop" className="hyperLink">
								our shop in Edinburgh
							</Link>
							.
						</p>
						<p className="text">
							The vouchers can be used towards any items bought in the
							store and are valid for 18 months from the date of
							purchase.
						</p>
					</div>
					<div className="image-container">
						<Image
							src="/images/gift-voucher.jpg"
							alt="Gift Voucher"
							width={400}
							height={400}
							className="responsive-image"
							priority
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
