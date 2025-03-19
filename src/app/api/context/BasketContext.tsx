"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the structure of a basket item
interface BasketItem {
	id: string;
	title: string;
	artist: string;
	price: number;
	coverImage?: string;
}

// Define the structure of the basket context
interface BasketContextType {
	basket: BasketItem[];
	addToBasket: (item: BasketItem) => void;
	removeFromBasket: (id: string) => void;
	clearBasket: () => void;
}

// Create the context with a default empty basket
const BasketContext = createContext<BasketContextType | undefined>(undefined);

// Basket provider component
export const BasketProvider = ({ children }: { children: ReactNode }) => {
	const [basket, setBasket] = useState<BasketItem[]>([]);

	// Add item to basket, but only if it's not already there
	const addToBasket = (item: BasketItem) => {
		// Check if the item is already in the basket
		if (!basket.find((existingItem) => existingItem.id === item.id)) {
			setBasket((prevBasket) => [...prevBasket, item]);
		} else {
			// You can add a notification or log here if you'd like
			alert(`${item.artist} - ${item.title} is already in your basket!`);
		}
	};

	// Remove item from basket
	const removeFromBasket = (id: string) => {
		setBasket((prevBasket) => prevBasket.filter((item) => item.id !== id));
	};

	// Clear the basket
	const clearBasket = () => {
		setBasket([]);
	};

	return (
		<BasketContext.Provider
			value={{ basket, addToBasket, removeFromBasket, clearBasket }}
		>
			{children}
		</BasketContext.Provider>
	);
};

// Hook to use basket context
export const useBasket = () => {
	const context = useContext(BasketContext);
	if (!context) {
		throw new Error("useBasket must be used within a BasketProvider");
	}
	return context;
};
