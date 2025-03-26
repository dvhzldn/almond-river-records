"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface BasketItem {
	id: string;
	title: string;
	artist: string;
	price: number;
	coverImage?: string;
}

interface BasketContextType {
	basket: BasketItem[];
	addToBasket: (item: BasketItem) => void;
	removeFromBasket: (id: string) => void;
	clearBasket: () => void;
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

	// Load basket from localStorage on mount
	useEffect(() => {
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
						setBasket(parsed.items);
					} else {
						console.info("Basket expired, clearing localStorage.");
						localStorage.removeItem(BASKET_STORAGE_KEY);
					}
				}
			} catch (err) {
				console.error("Failed to parse stored basket:", err);
			}
		}
	}, []);

	// Save basket to localStorage on change
	useEffect(() => {
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
		localStorage.removeItem(BASKET_STORAGE_KEY);
	};

	return (
		<BasketContext.Provider
			value={{ basket, addToBasket, removeFromBasket, clearBasket }}
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
