"use client";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";
export default function Menu() {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);
	const closeMenu = () => setIsOpen(false);

	return (
		<nav className="menu">
			<div className="burger" onClick={toggleMenu}>
				{isOpen ? <span>&#x2715;</span> : <span>&#9776;</span>}
			</div>
			<div className="menu-logo">
				<Link href="/"></Link>
			</div>
			<ul className={isOpen ? "nav-links open" : "nav-links"}>
				<li>
					<Link href="/basket" onClick={closeMenu}>
						<FontAwesomeIcon icon={faShoppingBasket} />
					</Link>
				</li>
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
		</nav>
	);
}
