"use client";
import { useCallback } from "react";
import { useAnalytics } from "@/lib/useAnalytics";
import { useAddToBasket as useCoreAddToBasket } from "./useAddToBasket";

export const useAddToBasketWithTracking = () => {
	const { track } = useAnalytics();
	const { handleAddToBasket: baseAddToBasket } = useCoreAddToBasket();

	const handleAddToBasket = useCallback(
		(
			record: {
				id: string;
				title: string;
				artistName: string[];
				price: number;
				coverImage: string;
			},
			onSuccess?: () => void
		) => {
			// Analytics
			track("add-to-basket", {
				title: record.title,
				artist: record.artistName.join(", "),
				artistTitle: `${record.artistName.join(", ")} - ${record.title}`,
			});

			// ✅ Fix basket structure to match BasketItem type
			baseAddToBasket(
				{
					id: record.id,
					title: record.title,
					artist: record.artistName.join(", "),
					price: record.price,
					coverImage: record.coverImage,
				},
				onSuccess
			);
		},
		[baseAddToBasket, track]
	);

	return { handleAddToBasket };
};
