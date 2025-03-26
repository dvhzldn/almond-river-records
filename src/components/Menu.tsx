"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
	const pathname = usePathname();
	const [animateBasket, setAnimateBasket] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);
	const closeMenu = () => setIsOpen(false);

	// Helper to determine if the link is active
	const isActive = (path: string) => pathname === path;

	// Trigger basket animation when basketCount changes
	useEffect(() => {
		if (basketCount > 0) {
			setAnimateBasket(true);
			const timer = setTimeout(() => {
				setAnimateBasket(false);
			}, 500); // duration should match your CSS animation duration
			return () => clearTimeout(timer);
		}
	}, [basketCount]);

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
					<li className={isActive("/") ? "active" : ""}>
						<Link href="/" onClick={closeMenu}>
							Home
						</Link>
					</li>
					<li className={isActive("/records") ? "active" : ""}>
						<Link href="/records" onClick={closeMenu}>
							Records for Sale
						</Link>
					</li>
					{/* <li className={isActive("/record-cleaning") ? "active" : ""}>
            <Link href="/record-cleaning" onClick={closeMenu}>
              Record Cleaning
            </Link>
          </li>
          <li className={isActive("/gift-vouchers") ? "active" : ""}>
            <Link href="/gift-vouchers" onClick={closeMenu}>
              Gift Vouchers
            </Link>
          </li> */}
					<li className={isActive("/about") ? "active" : ""}>
						<Link href="/about" onClick={closeMenu}>
							Visit The Shop
						</Link>
					</li>
					<li className={isActive("/contact") ? "active" : ""}>
						<Link href="/contact" onClick={closeMenu}>
							Get In Touch
						</Link>
					</li>
					<li className={isActive("/help") ? "active" : ""}>
						<Link href="/help" onClick={closeMenu}>
							Help
						</Link>
					</li>
				</ul>

				{/* Basket Icon (Right - Always Visible) */}
				<div className={`basket-wrapper ${animateBasket ? "animate" : ""}`}>
					<Link href="/basket" className="basket-link">
						<FontAwesomeIcon icon={faShoppingBasket} />
						{basketCount > 0 && (
							<span className="basket-count">{basketCount}</span>
						)}
					</Link>
				</div>
			</div>
		</nav>
	);
}
