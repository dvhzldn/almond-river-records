"use client";
import { useCallback } from "react";
import { useAnalytics } from "@/lib/useAnalytics";
import { useAddToBasket as useCoreAddToBasket } from "./useAddToBasket";
import type { BasketItem } from "@/types/BasketItem";

export const useAddToBasketWithTracking = () => {
	const { track } = useAnalytics();
	const { handleAddToBasket: baseAddToBasket } = useCoreAddToBasket();

	const handleAddToBasket = useCallback(
		(record: BasketItem, onSuccess?: () => void) => {
			track("add-to-basket", {
				title: record.title,
				artist: record.artistName.join(" & "),
				artistTitle: `${record.artistName.join(" & ")} - ${record.title}`,
			});

			baseAddToBasket(record, onSuccess);
		},
		[baseAddToBasket, track]
	);

	return { handleAddToBasket };
};
