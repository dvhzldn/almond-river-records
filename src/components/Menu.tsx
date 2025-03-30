"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faShoppingBasket,
	faBars,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useBasket } from "@/app/api/context/BasketContext";

export default function Menu() {
	const [hasMounted, setHasMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const { basket } = useBasket();
	const basketCount = basket.length;
	const pathname = usePathname();
	const [animateBasket, setAnimateBasket] = useState(false);

	const toggleMenu = () => setIsOpen((prev) => !prev);
	const closeMenu = () => setIsOpen(false);

	const firstNavLinkRef = useRef<HTMLAnchorElement | null>(null);
	const burgerButtonRef = useRef<HTMLButtonElement | null>(null);

	// Focus management when menu opens
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
			if (e.key === "Escape") {
				closeMenu();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Trigger basket animation when count changes
	useEffect(() => {
		if (basketCount > 0) {
			setAnimateBasket(true);
			const timer = setTimeout(() => setAnimateBasket(false), 500);
			return () => clearTimeout(timer);
		}
	}, [basketCount]);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const isActive = (path: string): boolean => {
		if (!pathname) return false;
		return path === "/" ? pathname === "/" : pathname.startsWith(path);
	};

	if (!hasMounted) return null;

	return (
		<nav className="menu" aria-label="Main site navigation">
			<div className="menu-container">
				{/* Burger Menu Button */}
				<button
					type="button"
					className="burger"
					onClick={toggleMenu}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close menu" : "Open menu"}
					ref={burgerButtonRef}
				>
					<FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
				</button>

				{/* Navigation Links */}
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

				{/* Basket Icon */}
				<div className={`basket-wrapper ${animateBasket ? "animate" : ""}`}>
					<Link
						href="/basket"
						className="basket-link"
						aria-label={`Basket with ${basketCount} item${basketCount !== 1 ? "s" : ""}`}
					>
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
