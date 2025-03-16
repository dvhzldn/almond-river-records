import { ReactNode } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
	children: ReactNode;
	onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
	return (
		<div className={styles.backdrop} onClick={onClose}>
			<div
				className={styles.modalContent}
				onClick={(e) => e.stopPropagation()}
			>
				<button className={styles.closeButton} onClick={onClose}>
					×
				</button>
				{children}
			</div>
		</div>
	);
}
