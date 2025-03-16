"use client";
import { ReactNode } from "react";

interface ModalProps {
	children: ReactNode;
	onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
	return (
		<div className="backdrop" onClick={onClose}>
			<div className="modalContent" onClick={(e) => e.stopPropagation()}>
				<button className="closeButton" onClick={onClose}>
					×
				</button>
				{children}
			</div>
		</div>
	);
}
