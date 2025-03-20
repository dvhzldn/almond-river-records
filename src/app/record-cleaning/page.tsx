import Image from "next/image";
import Link from "next/link";

export default function RecordCleaning() {
	return (
		<div className="page-container">
			<h1 className="page-title">Vinyl Record Cleaning Service</h1>

			<div className="content-box">
				<h2>In-Store Record Cleaning</h2>
				<h3>£1.70 per disc</h3>
				<h3>£15 for 10 discs</h3>

				<div className="two-column-layout">
					<div className="image-container">
						<Image
							src="/images/record-cleaning.jpg"
							alt="Vinyl record cleaning"
							width={500}
							height={350}
							className="responsive-image"
							priority
						/>
					</div>
					<div className="text-content">
						<p>
							We know how important it is to keep your vinyl collection
							in pristine condition. Whether you are a seasoned collector
							or a casual listener, a well-maintained record can make all
							the difference to your listening experience.
						</p>
						<p>
							Our in-store record cleaning service uses
							professional-grade equipment to gently and effectively
							clean your discs to remove dirt, dust, and grime.
						</p>
						<p>
							Drop by{" "}
							<Link href="/shop" className="hyperLink">
								our shop in Corstorphine
							</Link>{" "}
							anytime during our opening hours, and we will get your
							records back to their best, ready for you to enjoy. Just
							bring your records in, and we will take care of the rest!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
