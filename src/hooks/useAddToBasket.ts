"use client";
import { useCallback } from "react";
import { useBasket } from "@/app/api/context/BasketContext";

export interface AddToBasketPayload {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	coverImage?: string | null;
}

export const useAddToBasket = () => {
	const { addToBasket } = useBasket();

	const handleAddToBasket = useCallback(
		(item: AddToBasketPayload, onSuccess?: () => void) => {
			const basketItem = {
				id: item.id,
				title: item.title,
				artist: item.artistName.join(" & "),
				price: item.price,
				coverImage: item.coverImage || "",
			};

			addToBasket(basketItem);

			if (onSuccess) {
				onSuccess();
			}
		},
		[addToBasket]
	);

	return { handleAddToBasket };
};
