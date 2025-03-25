"use client";
import ReturnsPolicy from "./ReturnsPolicy";
import React from "react";

interface ReturnsPolicyModalProps {
	onClose: () => void;
}

const ReturnsPolicyModal: React.FC<ReturnsPolicyModalProps> = ({ onClose }) => {
	return (
		<div className="backdrop" onClick={onClose}>
			<div
				className="modalContent"
				onClick={(e) => e.stopPropagation()}
				style={{ maxHeight: "80vh", overflowY: "auto" }} // ensures scrollability
			>
				<button className="closeButton" onClick={onClose}>
					×
				</button>
				<ReturnsPolicy />
			</div>
		</div>
	);
};

export default ReturnsPolicyModal;
