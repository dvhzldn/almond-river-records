"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

interface Record {
	id: string;
	title: string;
	artistName: string[];
	price: number;
	vinylCondition: string;
	coverImage: string | null;
	label: string;
	sleeveCondition: string;
	inStock: boolean;
}

export default function RecordsPage() {
	const [records, setRecords] = useState<Record[]>([]);
	const [search, setSearch] = useState("");
	const [priceMin, setPriceMin] = useState("");
	const [priceMax, setPriceMax] = useState("");
	const [condition, setCondition] = useState("");
	const [loading, setLoading] = useState(true);
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

	// ✅ Fetch records with filters
	const fetchRecords = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams();
		if (search) params.append("search", search);
		if (priceMin) params.append("priceMin", priceMin);
		if (priceMax) params.append("priceMax", priceMax);
		if (condition) params.append("condition", condition);

		try {
			const res = await fetch(`/api/records?${params.toString()}`);
			const data = await res.json();
			setRecords(data.records);
		} catch (error) {
			console.error("Failed to fetch records:", error);
		} finally {
			setLoading(false);
		}
	}, [search, priceMin, priceMax, condition]);

	useEffect(() => {
		fetchRecords();
	}, [fetchRecords]);

	return (
		<section className="section">
			<h1>Records for Sale</h1>

			{/* Filter Controls */}
			<div className="filter-controls">
				<input
					type="text"
					placeholder="Search for items..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Min Price"
					value={priceMin}
					onChange={(e) => setPriceMin(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Max Price"
					value={priceMax}
					onChange={(e) => setPriceMax(e.target.value)}
				/>
				<select
					value={condition}
					onChange={(e) => setCondition(e.target.value)}
				>
					<option value="">All Conditions</option>
					<option value="Mint">Mint</option>
					<option value="Near Mint">Near Mint</option>
					<option value="Very Good Plus">Very Good Plus</option>
					<option value="Very Good">Very Good</option>
					<option value="Good">Good</option>
				</select>
				<button onClick={fetchRecords}>Apply Filters</button>
			</div>

			{/* Display Records in a Grid */}
			{loading ? (
				<p>Loading...</p>
			) : records.length === 0 ? (
				<p>No records found.</p>
			) : (
				<div className="records-grid">
					{records.map((record) => (
						<div
							key={record.id}
							className="record-card"
							onClick={() => setSelectedRecord(record)}
						>
							<div>
								{record.coverImage ? (
									<Image
										className="record-image"
										src={record.coverImage}
										alt={record.title}
										width={150}
										height={150}
									/>
								) : (
									<Image
										className="record-image"
										src="/placeholder.jpg"
										alt="No cover available"
										width={150}
										height={150}
									/>
								)}

								<div className="record-details">
									<h2>{record.artistName.join(", ")}</h2>
									<h3>{record.title}</h3>
									<p>Price: £{record.price}</p>
									<p>Condition: {record.vinylCondition}</p>
									<p>
										Stock:{" "}
										{record.inStock ? "Available" : "Out of Stock"}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal for Record Details */}
			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</section>
	);
}
