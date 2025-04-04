"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBasket } from "@/app/api/context/BasketContext";
import { ShoppingBasket, Menu, X } from "lucide-react";

export default function SiteMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [animateBasket, setAnimateBasket] = useState(false);
	const { basket } = useBasket();
	const basketCount = basket.length;
	const pathname = usePathname();

	const toggleMenu = () => setIsOpen((prev) => !prev);
	const closeMenu = () => setIsOpen(false);

	const firstNavLinkRef = useRef<HTMLAnchorElement | null>(null);
	const burgerButtonRef = useRef<HTMLButtonElement | null>(null);

	// Focus management when menu opens/closes
	useEffect(() => {
		if (isOpen && firstNavLinkRef.current) {
			firstNavLinkRef.current.focus();
		}
		if (!isOpen && burgerButtonRef.current) {
			burgerButtonRef.current.focus();
		}
	}, [isOpen]);

	// Close menu on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeMenu();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Trigger basket animation on update
	useEffect(() => {
		if (basketCount > 0) {
			setAnimateBasket(true);
			const timer = setTimeout(() => setAnimateBasket(false), 500);
			return () => clearTimeout(timer);
		}
	}, [basketCount]);

	const isActive = (path: string): boolean => {
		if (!pathname) return false;
		return path === "/" ? pathname === "/" : pathname.startsWith(path);
	};

	return (
		<nav className="menu" aria-label="Main site navigation">
			<div className="menu-container">
				{/* Burger Button */}
				<button
					type="button"
					className="burger"
					onClick={toggleMenu}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close menu" : "Open menu"}
					ref={burgerButtonRef}
				>
					{isOpen ? <X size={20} /> : <Menu size={20} />}
				</button>

				{/* Nav Links */}
				<ul className={isOpen ? "nav-links open" : "nav-links"}>
					<li className={isActive("/") ? "active" : ""}>
						<Link href="/" onClick={closeMenu} ref={firstNavLinkRef}>
							Home
						</Link>
					</li>
					<li className={isActive("/records") ? "active" : ""}>
						<Link href="/records" onClick={closeMenu}>
							Records for Sale
						</Link>
					</li>
					<li className={isActive("/about") ? "active" : ""}>
						<Link href="/about" onClick={closeMenu}>
							Visit The Shop
						</Link>
					</li>
					<li className={isActive("/record-cleaning") ? "active" : ""}>
						<Link href="/record-cleaning" onClick={closeMenu}>
							Record Cleaning
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

				{/* Basket */}
				<div className={`basket-wrapper ${animateBasket ? "animate" : ""}`}>
					<Link
						href="/basket"
						className="basket-link"
						aria-label={`Basket with ${basketCount} item${basketCount !== 1 ? "s" : ""}`}
					>
						<ShoppingBasket
							size={25}
							className={`basket-icon ${animateBasket ? "animate" : ""}`}
						/>
						<span
							className="basket-count"
							data-empty={basketCount === 0}
							aria-hidden={basketCount === 0}
						>
							{basketCount > 0 ? basketCount : "\u00A0"}
						</span>
					</Link>
				</div>
			</div>
		</nav>
	);
}
