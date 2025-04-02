"use client";
import { useCallback } from "react";
import { useBasket } from "@/app/api/context/BasketContext";
import { useAnalytics } from "@/lib/useAnalytics";

export interface AddToBasketPayload {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	coverImage?: string | null;
}

export const useAddToBasket = () => {
	const { addToBasket } = useBasket();
	const { track } = useAnalytics();

	const handleAddToBasket = useCallback(
		(item: AddToBasketPayload, onSuccess?: () => void) => {
			const basketItem = {
				id: item.id,
				title: item.title,
				artistName: Array.isArray(item.artistName)
					? item.artistName
					: [item.artistName],
				price: item.price,
				coverImage: item.coverImage || "",
			};

			addToBasket(basketItem);
			track("add-to-basket", { recordId: item.id, price: item.price });

			if (onSuccess) {
				onSuccess();
			}
		},
		[addToBasket, track]
	);

	return { handleAddToBasket };
};
