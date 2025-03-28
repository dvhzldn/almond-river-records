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
				coverImage?: string;
			},
			onSuccess?: () => void
		) => {
			track("add-to-basket", {
				recordId: record.id,
				price: record.price,
			});

			baseAddToBasket(
				{
					id: record.id,
					title: record.title,
					artistName: record.artistName,
					price: record.price,
					coverImage: record.coverImage || "",
				},
				onSuccess
			);
		},
		[baseAddToBasket, track]
	);

	return { handleAddToBasket };
};
