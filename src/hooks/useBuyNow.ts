"use client";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/lib/useAnalytics";
import { useAddToBasketWithTracking } from "./useAddToBasketWithTracking";

export const useBuyNow = () => {
	const router = useRouter();
	const { track } = useAnalytics();
	const { handleAddToBasket } = useAddToBasketWithTracking();

	const handleBuyNow = (record: {
		id: string;
		title: string;
		artistName: string[];
		price: number;
		coverImage?: string;
	}) => {
		track("buy-record", { recordId: record.id, price: record.price });

		handleAddToBasket({
			id: record.id,
			title: record.title,
			artistName: record.artistName,
			price: record.price,
			coverImage: record.coverImage || "",
		});

		router.push("/basket");
	};

	return { handleBuyNow };
};
