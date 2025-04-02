"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

import { BasketItem } from "@/types/BasketItem";

interface BasketContextType {
	basket: BasketItem[];
	addToBasket: (item: BasketItem) => void;
	removeFromBasket: (id: string) => void;
	clearBasket: () => void;
	hydrated: boolean;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const BASKET_STORAGE_KEY = "almond-river-basket";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

type StoredBasket = {
	items: BasketItem[];
	savedAt: number;
};

export const BasketProvider = ({ children }: { children: ReactNode }) => {
	const [basket, setBasket] = useState<BasketItem[]>([]);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// Load basket data from localStorage
		const stored = localStorage.getItem(BASKET_STORAGE_KEY);
		if (stored) {
			try {
				const parsed: StoredBasket = JSON.parse(stored);
				const now = Date.now();

				if (
					parsed &&
					Array.isArray(parsed.items) &&
					typeof parsed.savedAt === "number"
				) {
					const age = now - parsed.savedAt;
					if (age <= EXPIRY_MS) {
						// Only load items if they are not expired
						const sanitizedItems = parsed.items.map((item) => ({
							...item,
							coverImage:
								item.coverImage && item.coverImage.trim() !== ""
									? item.coverImage
									: "/images/almond-river-logo.jpg", // Default image if empty
						}));
						setBasket(sanitizedItems);
					} else {
						console.info("Basket expired, clearing localStorage.");
						localStorage.removeItem(BASKET_STORAGE_KEY); // Clear expired items
					}
				}
			} catch (err) {
				console.error("Failed to parse stored basket:", err);
			}
		}
		setHydrated(true); // Mark as hydrated after basket data is processed
	}, []);

	useEffect(() => {
		// Update localStorage whenever basket state changes
		const payload: StoredBasket = {
			items: basket,
			savedAt: Date.now(),
		};
		localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(payload));
	}, [basket]);

	const addToBasket = (item: BasketItem) => {
		if (!basket.find((existingItem) => existingItem.id === item.id)) {
			setBasket((prev) => [...prev, item]);
		}
	};

	const removeFromBasket = (id: string) => {
		setBasket((prev) => prev.filter((item) => item.id !== id));
	};

	const clearBasket = () => {
		setBasket([]);
		localStorage.removeItem(BASKET_STORAGE_KEY); // Clear the basket from localStorage
	};

	return (
		<BasketContext.Provider
			value={{
				basket,
				addToBasket,
				removeFromBasket,
				clearBasket,
				hydrated, // Provide hydrated state to other components
			}}
		>
			{children}
		</BasketContext.Provider>
	);
};

export const useBasket = () => {
	const context = useContext(BasketContext);
	if (!context) {
		throw new Error("useBasket must be used within a BasketProvider");
	}
	return context;
};
