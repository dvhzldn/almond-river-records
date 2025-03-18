import Image from "next/image";
import NewThisWeek from "@/components/NewThisWeek";

export default function Home() {
	return (
		<section className="section">
			<h1>Almond River Records</h1>
			<Image
				className="logo"
				src="/images/almond-river-logo.jpg"
				alt="Almond River Records logo"
				width={300}
				height={300}
				priority
			/>

			<div>
				<NewThisWeek />
			</div>
		</section>
	);
}
