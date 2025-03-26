"use client";

import { useEffect } from "react";
import { useBasket } from "@/app/api/context/BasketContext";

interface Props {
	checkoutStatus: string;
}

export default function ClearBasketOnSuccess({ checkoutStatus }: Props) {
	const { clearBasket } = useBasket();

	useEffect(() => {
		if (checkoutStatus === "PAID") {
			clearBasket();
		}
	}, [checkoutStatus, clearBasket]);

	return null;
}
