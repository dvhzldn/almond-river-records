"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { VinylRecord } from "@/hooks/useRecords";
import { useAddToBasketWithTracking } from "@/hooks/useAddToBasketWithTracking";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useBasket } from "@/app/api/context/BasketContext";
import { useAnalytics } from "@/lib/useAnalytics";
import { ShoppingBasket } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const Modal = dynamic(() => import("@/components/Modal"), { ssr: false });

interface Props {
	initialRecords: VinylRecord[];
	artistOptions: string[];
	genreOptions: string[];
}

const pageSize = 24;

export default function ClientRecordBrowser({
	initialRecords,
	artistOptions,
	genreOptions,
}: Props) {
	const { handleAddToBasket } = useAddToBasketWithTracking();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const { handleBuyNow } = useBuyNow();
	const { basket } = useBasket();
	const { track } = useAnalytics();

	const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(
		null
	);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [condition, setCondition] = useState("");
	const [artist, setArtist] = useState("");
	const [genre, setGenre] = useState("");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [decade, setDecade] = useState("");
	const [sort, setSort] = useState("recent");
	const [page, setPage] = useState(1);
	const [records, setRecords] = useState<VinylRecord[]>(initialRecords);
	const [total, setTotal] = useState(initialRecords.length);
	const [loading, setLoading] = useState(false);

	const filtersApplied =
		searchInput.trim() !== "" ||
		condition.trim() !== "" ||
		artist.trim() !== "" ||
		decade.trim() !== "" ||
		genre.trim() !== "";

	const isInBasket = useCallback(
		(id: string) => basket.some((item) => item.id === id),
		[basket]
	);

	useEffect(() => {
		async function fetchRecords() {
			setLoading(true);
			const params = new URLSearchParams();
			if (search) params.append("search", search);
			if (condition) params.append("condition", condition);
			if (artist) params.append("artist", artist);
			if (genre) params.append("genre", genre);
			if (decade) params.append("decade", decade);
			if (sort) params.append("sort", sort);
			params.append("limit", pageSize.toString());
			params.append("skip", ((page - 1) * pageSize).toString());

			try {
				const res = await fetch(`/api/records?${params.toString()}`);
				const data = await res.json();
				setRecords(data.records);
				setTotal(data.total);
			} catch (err) {
				console.error("Failed to load records", err);
			} finally {
				setLoading(false);
			}
		}

		fetchRecords();
	}, [search, condition, artist, genre, decade, sort, page]);

	const renderedRecords = useMemo(() => {
		return records.map((record) => (
			<div
				key={record.id}
				className="record-card"
				onClick={() => setSelectedRecord(record)}
			>
				<div className="record-image-container">
					<Image
						className="record-image"
						src={record.coverImageUrl || "/placeholder.jpg"}
						alt={`${record.title} by ${record.artistName.join(", ")}`}
						width={250}
						height={250}
					/>
					<div className="record-price">£{record.price}</div>
				</div>
				<div className="record-details">
					<h3 className="record-title">{record.title}</h3>
					<h4 className="artist-name">{record.artistName.join(" & ")}</h4>
					<p className="condition">Condition: {record.vinylCondition}</p>
					<div className="record-actions">
						{isInBasket(record.id) ? (
							<button
								className="remove-button-grid"
								onClick={(e) => {
									e.stopPropagation();
									handleRemoveFromBasket(record.id);
								}}
							>
								Remove <ShoppingBasket size={12} />
							</button>
						) : (
							<button
								className="basket-button"
								onClick={(e) => {
									e.stopPropagation();
									handleAddToBasket(record);
								}}
							>
								Add <ShoppingBasket size={12} />
							</button>
						)}
						<button
							className="buy-button"
							onClick={(e) => {
								e.stopPropagation();
								handleBuyNow(record);
							}}
						>
							Buy
						</button>
					</div>
				</div>
			</div>
		));
	}, [
		records,
		handleAddToBasket,
		handleRemoveFromBasket,
		handleBuyNow,
		isInBasket,
	]);

	const totalPages = Math.ceil(total / pageSize);
	const prevPage = () => setPage((p) => Math.max(p - 1, 1));
	const nextPage = () => setPage((p) => p + 1);

	return (
		<div className="content-box-grid">
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
							track("filter-applied", {
								filter: "artist",
								value: e.target.value,
							});
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
						value={genre}
						onChange={(e) => {
							setGenre(e.target.value);
							setPage(1);
							track("filter-applied", {
								filter: "genre",
								value: e.target.value,
							});
						}}
					>
						<option value="">All Genres</option>
						{genreOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>

					<select
						value={decade}
						onChange={(e) => {
							setDecade(e.target.value);
							setPage(1);
							track("filter-applied", {
								filter: "decade",
								value: e.target.value,
							});
						}}
					>
						<option value="">All Decades</option>
						<option value="1950">1950s</option>
						<option value="1960">1960s</option>
						<option value="1970">1970s</option>
						<option value="1980">1980s</option>
						<option value="1990">1990s</option>
						<option value="2000">2000s</option>
						<option value="2010">2010s</option>
						<option value="2020">2020s</option>
					</select>

					<select
						value={condition}
						onChange={(e) => {
							setCondition(e.target.value);
							setPage(1);
							track("filter-applied", {
								filter: "condition",
								value: e.target.value,
							});
						}}
					>
						<option value="">All Conditions</option>
						<option value="Mint">Mint</option>
						<option value="Near Mint">Near Mint</option>
						<option value="Very Good Plus">Very Good Plus</option>
						<option value="Very Good">Very Good</option>
						<option value="Good">Good</option>
					</select>

					<input
						type="text"
						placeholder="Search all records..."
						aria-label="Search records"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setSearch(searchInput);
								setPage(1);
								track("record-search", { term: searchInput.trim() });
							}
						}}
					/>

					<button
						onClick={() => {
							setSearch(searchInput);
							setPage(1);
							track("record-search", { term: searchInput.trim() });
						}}
					>
						Search
					</button>
				</div>

				<h4>Sort records by:</h4>
				<select
					value={sort}
					onChange={(e) => {
						setSort(e.target.value);
						setPage(1);
						track("sort-changed", { sortOption: e.target.value });
					}}
				>
					<option value="recent">Recently Added</option>
					<option value="artist">Artist Name (A-Z)</option>
				</select>

				{filtersApplied && (
					<div>
						<button
							className="clear-filters-button"
							onClick={() => {
								setSearch("");
								setSearchInput("");
								setCondition("");
								setArtist("");
								setGenre("");
								setDecade("");
								setPage(1);
							}}
						>
							Reset Filters
						</button>
					</div>
				)}
			</div>

			<div className="records-grid">
				{loading ? (
					<p>Loading...</p>
				) : records.length > 0 ? (
					renderedRecords
				) : (
					<p>No records found.</p>
				)}
			</div>

			{totalPages > 1 && (
				<div
					className="pagination"
					role="navigation"
					aria-label="Pagination"
				>
					<button onClick={prevPage} disabled={page === 1}>
						Previous
					</button>
					<span>
						Page {page} of {totalPages}
					</span>
					<button onClick={nextPage} disabled={page * pageSize >= total}>
						Next
					</button>
				</div>
			)}

			{selectedRecord && (
				<Modal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</div>
	);
}
