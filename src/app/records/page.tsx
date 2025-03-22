"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "@/components/Modal";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";
import { useAddToBasket } from "@/hooks/useAddToBasket";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBasket } from "@/app/api/context/BasketContext";

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
	const [totalRecords, setTotalRecords] = useState<number>(0);
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

	// Hooks for basket actions
	const { handleAddToBasket } = useAddToBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const { basket } = useBasket();

	// Next.js router for navigation
	const router = useRouter();

	// Fetch distinct artist options from Contentful
	useEffect(() => {
		async function fetchArtists() {
			try {
				const res = await client.getEntries({
					content_type: "vinylRecord",
					select: ["fields.artistName"],
				});
				const allArtists = res.items.flatMap((item) => {
					const fields = item.fields as unknown as IVinylRecordFields;
					return fields.artistName || [];
				});
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

	// Fetch distinct genres from Contentful
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
		if (artist) params.append("artist", artist);
		params.append("limit", pageSize.toString());
		params.append("skip", ((page - 1) * pageSize).toString());

		try {
			const res = await fetch(`/api/records?${params.toString()}`);
			const data = await res.json();
			setRecords(data.records);
			setTotalRecords(data.total); // update total records from API response
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

	// Calculate total pages:
	const totalPages = Math.ceil(totalRecords / pageSize);

	// Handler for the "Buy" button on a record card
	const handleBuy = (record: Record, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering card onClick that opens Modal
		const queryParams = new URLSearchParams({
			recordId: record.id,
			price: record.price.toString(),
			description: `${record.artistName.join(" & ")} - ${record.title}`,
			title: record.title,
			artist: record.artistName.join(" & "),
			coverImage: record.coverImage || "",
		}).toString();

		// Navigate to /place-order with the query parameters.
		router.push(`/place-order?${queryParams}`);
	};

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
				<div className={`filter-controls ${filtersOpen ? "open" : ""}`}>
					<select
						value={artist}
						onChange={(e) => {
							setArtist(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All Artists</option>
						{artistOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<select
						value={condition}
						onChange={(e) => {
							setCondition(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All Conditions</option>
						<option value="Mint">Mint</option>
						<option value="Near Mint">Near Mint</option>
						<option value="Very Good Plus">Very Good Plus</option>
						<option value="Very Good">Very Good</option>
						<option value="Good">Good</option>
					</select>
					<select
						value={genre}
						onChange={(e) => {
							setGenre(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All Genres</option>
						{genreOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<input
						type="number"
						placeholder="Min Price"
						value={priceMin}
						onChange={(e) => {
							setPriceMin(e.target.value);
							setPage(1);
						}}
					/>
					<input
						type="number"
						placeholder="Max Price"
						value={priceMax}
						onChange={(e) => {
							setPriceMax(e.target.value);
							setPage(1);
						}}
					/>
					<input
						type="text"
						placeholder="Search all records..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setSearch(searchInput);
								setPage(1);
							}
						}}
					/>
					<button
						onClick={() => {
							setSearch(searchInput);
							setPage(1);
						}}
					>
						Search
					</button>
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
			<div className="content-box-grid">
				{loading ? (
					<p>Loading...</p>
				) : records.length === 0 ? (
					<p>No records found.</p>
				) : (
					<div className="records-grid">
						{records.map((record) => {
							const isInBasket = basket.some(
								(item) => item.id === record.id
							);

							return (
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
										<div className="record-price">
											£{record.price}
										</div>
									</div>
									<div className="record-details">
										<h3 className="record-title">{record.title}</h3>
										<h4 className="artist-name">
											{record.artistName.join(", ")}
										</h4>
										<p>Condition: {record.vinylCondition}</p>
										<div className="record-actions">
											<button
												className="buy-button"
												onClick={(e) => handleBuy(record, e)}
											>
												Buy
											</button>
											{isInBasket ? (
												<button
													className="basket-button"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFromBasket(record.id);
													}}
												>
													Remove from Basket
												</button>
											) : (
												<button
													className="basket-button"
													onClick={(e) => {
														e.stopPropagation();
														handleAddToBasket({
															id: record.id,
															title: record.title,
															artistName: record.artistName,
															price: record.price,
															coverImage:
																record.coverImage || "",
														});
													}}
												>
													Add to Basket
												</button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
			{/* Pagination Controls */}
			<div className="pagination">
				<button onClick={prevPage} disabled={page === 1}>
					Previous
				</button>
				<span>
					Page {page} of {totalPages}
				</span>
				<button
					onClick={nextPage}
					disabled={page * pageSize >= totalRecords}
				>
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
