// app/components/SimulatePayment.tsx
import React, { useState } from "react";

const SimulatePayment: React.FC = () => {
	const [amount, setAmount] = useState<number>(1000); // 1000 pence = £10
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Use a valid test access token from your OAuth flow
	const accessToken = process.env.NEXT_PUBLIC_SUMUP_TEST_TOKEN;

	const handlePayment = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/sumup/createPaymentLink", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					accessToken: accessToken,
					amount,
				}),
			});

			if (!response.ok) {
				const errData = await response.json();
				setError(errData.error || "Error creating checkout");
				setLoading(false);
				return;
			}

			const data = await response.json();
			console.log("Checkout data:", data);

			if (data.checkout_link) {
				window.location.href = data.checkout_link;
			} else if (data.id) {
				window.location.href = `/payment-success?checkout_id=${data.id}`;
			} else {
				setError("No checkout link returned.");
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError("Unexpected error: " + err.message);
			} else {
				setError("An unexpected error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Simulate Payment</h2>
			<label htmlFor="amount">
				Amount:
				<input
					id="amount"
					type="number"
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
					style={{ marginLeft: "0.5rem" }}
				/>
			</label>
			<br />
			<button
				onClick={handlePayment}
				disabled={loading}
				style={{ marginTop: "1rem" }}
			>
				{loading ? "Processing..." : "Pay with SumUp"}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default SimulatePayment;
