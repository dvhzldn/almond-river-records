"use client";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faShoppingBasket,
	faBars,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useBasket } from "@/app/api/context/BasketContext";

export default function Menu() {
	const [isOpen, setIsOpen] = useState(false);
	const { basket } = useBasket();
	const basketCount = basket.length;

	const toggleMenu = () => setIsOpen(!isOpen);
	const closeMenu = () => setIsOpen(false);

	return (
		<nav className="menu">
			<div className="menu-container">
				{/* Burger Menu Button (Left) */}
				<div className="burger" onClick={toggleMenu}>
					{isOpen ? (
						<FontAwesomeIcon icon={faTimes} />
					) : (
						<FontAwesomeIcon icon={faBars} />
					)}
				</div>

				{/* Navigation Links (Centered) */}
				<ul className={isOpen ? "nav-links open" : "nav-links"}>
					<li>
						<Link href="/" onClick={closeMenu}>
							Home
						</Link>
					</li>
					<li>
						<Link href="/records" onClick={closeMenu}>
							Records
						</Link>
					</li>
					<li>
						<Link href="/about" onClick={closeMenu}>
							Shop
						</Link>
					</li>
					<li>
						<Link href="/contact" onClick={closeMenu}>
							Get In Touch
						</Link>
					</li>
				</ul>

				{/* Basket Icon (Right - Always Visible) */}
				<div className="basket-wrapper">
					<Link href="/basket" className="basket-link">
						<FontAwesomeIcon icon={faShoppingBasket} />
						{basketCount > 0 && (
							<span className="basket-count">{basketCount}</span>
						)}{" "}
						{}
					</Link>
				</div>
			</div>
		</nav>
	);
}
