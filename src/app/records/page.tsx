"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";

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
	releaseYear?: number | null;
	genre: string;
}

export default function RecordsPage() {
	const [records, setRecords] = useState<Record[]>([]);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [priceMin, setPriceMin] = useState("");
	const [priceMax, setPriceMax] = useState("");
	const [condition, setCondition] = useState("");
	const [artist, setArtist] = useState("");
	const [artistOptions, setArtistOptions] = useState<string[]>([]);
	const [genre, setGenre] = useState("");
	const [genreOptions, setGenreOptions] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [page, setPage] = useState(1);
	const pageSize = 12;

	// Fetch distinct artist options (deduplicated) from Contentful
	useEffect(() => {
		async function fetchArtists() {
			try {
				const res = await client.getEntries({
					content_type: "vinylRecord",
					select: ["fields.artistName"],
				});
				// Flatten the arrays (each record may have more than one artist)
				const allArtists = res.items.flatMap((item) => {
					// Cast via unknown to satisfy the type
					const fields = item.fields as unknown as IVinylRecordFields;
					return fields.artistName || [];
				});
				// Deduplicate using a Set
				const uniqueArtists = Array.from(new Set(allArtists)).sort((a, b) =>
					a.localeCompare(b)
				);
				setArtistOptions(uniqueArtists);
			} catch (error) {
				console.error("Error fetching artists:", error);
			}
		}
		fetchArtists();
	}, []);

	useEffect(() => {
		async function fetchGenres() {
			try {
				const res = await client.getEntries({
					content_type: "vinylRecord",
				});
				const allGenres = res.items.flatMap((item) => {
					const fields = item.fields as unknown as IVinylRecordFields;
					return fields.genre ?? [];
				});
				const uniqueGenres = Array.from(
					new Set(allGenres.filter(Boolean))
				).sort((a, b) => a.localeCompare(b));
				setGenreOptions(uniqueGenres);
			} catch (error) {
				console.error("Error fetching genres:", error);
			}
		}
		fetchGenres();
	}, []);

	// Fetch records with filters and pagination
	const fetchRecords = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams();
		if (search) params.append("search", search);
		if (priceMin) params.append("priceMin", priceMin);
		if (priceMax) params.append("priceMax", priceMax);
		if (condition) params.append("condition", condition);
		if (genre) params.append("genre", genre);
		if (artist) params.append("artist", artist); // Pass selected artist
		params.append("limit", pageSize.toString());
		params.append("skip", ((page - 1) * pageSize).toString());

		try {
			const res = await fetch(`/api/records?${params.toString()}`);
			const data = await res.json();
			setRecords(data.records);
		} catch (error) {
			console.error("Failed to fetch records:", error);
		} finally {
			setLoading(false);
		}
	}, [search, priceMin, priceMax, condition, artist, genre, page]);

	useEffect(() => {
		fetchRecords();
	}, [fetchRecords]);

	const nextPage = () => setPage((prev) => prev + 1);
	const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

	return (
		<div className="page-container">
			<h1 className="page-title">Records for Sale</h1>

			{/* Filter Menu for Mobile */}
			<div className="filter-menu">
				<button
					className="filter-toggle"
					onClick={() => setFiltersOpen(!filtersOpen)}
				>
					{filtersOpen ? "Close Filters" : "Show Filters"}
				</button>
				{/* Filter Controls */}
				<div className={`filter-controls ${filtersOpen ? "open" : ""}`}>
					{/* Artist Dropdown */}
					<select
						value={artist}
						onChange={(e) => setArtist(e.target.value)}
					>
						<option value="">All Artists</option>
						{artistOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{/* Record Condition */}
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
					<select value={genre} onChange={(e) => setGenre(e.target.value)}>
						<option value="">All Genres</option>
						{genreOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{/* Pricing */}
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
					/>{" "}
					{/* Global Search */}
					<input
						type="text"
						placeholder="Search all records..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setSearch(searchInput);
							}
						}}
					/>
					<button onClick={() => setSearch(searchInput)}>Search</button>
				</div>
				<div>
					<button
						className="clear-filters-button"
						onClick={() => {
							setSearch("");
							setSearchInput("");
							setPriceMin("");
							setPriceMax("");
							setCondition("");
							setArtist("");
							setPage(1);
							setGenre("");
						}}
					>
						Clear Filters
					</button>
				</div>
			</div>
			<div className="content-box">
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
								<div className="record-image-container">
									{record.coverImage ? (
										<Image
											className="record-image"
											src={record.coverImage}
											alt={record.title}
											width={250}
											height={250}
										/>
									) : (
										<Image
											className="record-image"
											src="/placeholder.jpg"
											alt="No cover available"
											width={250}
											height={250}
										/>
									)}
									<div className="record-price">£{record.price}</div>
								</div>
								<div className="record-details">
									<h3 className="record-title">{record.title}</h3>
									<h4 className="artist-name">
										{record.artistName.join(", ")}
									</h4>
									<p>Condition: {record.vinylCondition}</p>
									<p>
										{/* <strong>
											Stock:
											{record.inStock ? "Available" : "Out of Stock"}
										</strong> */}
									</p>
									<div className="record-actions">
										<button className="grid-buy-button">Buy</button>
										<button className="grid-basket-button">
											Add to Basket
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			{/* Pagination Controls */}
			<div className="pagination">
				<button onClick={prevPage} disabled={page === 1}>
					Previous
				</button>
				<span>Page {page}</span>
				<button onClick={nextPage} disabled={records.length < pageSize}>
					Next
				</button>
			</div>

			{/* Modal for Record Details */}
			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</div>
	);
}
