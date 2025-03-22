"use client";
import { useCallback } from "react";
import { useBasket } from "@/app/api/context/BasketContext";

export const useRemoveFromBasket = () => {
	const { removeFromBasket } = useBasket();

	const handleRemoveFromBasket = useCallback(
		(id: string, onSuccess?: () => void) => {
			removeFromBasket(id);
			if (onSuccess) {
				onSuccess();
			}
		},
		[removeFromBasket]
	);

	return { handleRemoveFromBasket };
};
