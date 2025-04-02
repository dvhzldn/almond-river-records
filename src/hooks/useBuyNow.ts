"use client";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/lib/useAnalytics";
import { useAddToBasket } from "./useAddToBasket";

const DEFAULT_COVER_IMAGE = "/images/almond-river-logo.jpg";

export const useBuyNow = () => {
	const router = useRouter();
	const { track } = useAnalytics();
	const { handleAddToBasket } = useAddToBasket();

	const handleBuyNow = async (record: {
		id: string;
		title: string;
		artistName: string[];
		price: number;
		coverImage?: string | null;
	}) => {
		track("buy-record", {
			title: record.title,
			artist: record.artistName.join(", "),
			artistTitle: `${record.artistName.join(", ")} - ${record.title}`,
		});

		const coverImage = record.coverImage || DEFAULT_COVER_IMAGE;

		await handleAddToBasket({
			id: record.id,
			title: record.title,
			artistName: record.artistName,
			price: record.price,
			coverImage,
		});

		router.push("/basket");
	};

	return { handleBuyNow };
};
