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
import { useMediaQuery } from "react-responsive";

const Modal = dynamic(() => import("./Modal"), {
	ssr: false,
	loading: () => null,
});

interface Props {
	initialRecords?: VinylRecord[];
	artistOptions?: string[];
	genreOptions?: string[];
}

export default function ClientRecordBrowser({
	initialRecords = [],
	artistOptions = [],
	genreOptions = [],
}: Props) {
	const isMobile = useMediaQuery({ maxWidth: 768 });
	const pageSize = isMobile ? 12 : 24;

	const { handleAddToBasket } = useAddToBasketWithTracking();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const { handleBuyNow } = useBuyNow();
	const { basket } = useBasket();
	const { track } = useAnalytics();

	// Local state for fetched records, filters, and pagination
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

	// Memoizing filters to avoid unnecessary re-renders
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

	// Fetch records when the filters or page change
	useEffect(() => {
		const fetchRecords = async () => {
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
		};

		// Only trigger the fetch if there is a change in filters, page, or page size
		fetchRecords();
	}, [search, condition, artist, genre, decade, sort, page, pageSize]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}, 100);

		return () => clearTimeout(timeout);
	}, [page]);

	// Memoize rendered records to prevent unnecessary re-renders
	const renderedRecords = useMemo(() => {
		return records.map((record) => (
			<div
				key={record.id}
				className="record-card"
				tabIndex={0}
				role="button"
				aria-label={`View details for ${record.title} by ${record.artistName.join(", ")}`}
				onClick={() => setSelectedRecord(record)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setSelectedRecord(record);
					}
				}}
			>
				<div className="record-image-container">
					<Image
						className="record-image"
						src={record.coverImageUrl || "/placeholder.jpg"}
						alt={`${record.title} by ${record.artistName.join(" & ")}`}
						width={250}
						height={250}
						sizes="(max-width: 768px) 100vw, 250px"
						quality={60}
						loading="eager"
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
								aria-label={`Remove ${record.title} by ${record.artistName.join(" & ")} from your basket`}
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
								aria-label={`Add ${record.title} by ${record.artistName.join(" & ")} to your basket`}
								className="basket-button"
								onClick={(e) => {
									e.stopPropagation();
									handleAddToBasket({
										id: record.id,
										title: record.title,
										artistName: record.artistName,
										price: record.price,
										coverImage: record.coverImageUrl,
									});
								}}
							>
								Add <ShoppingBasket size={12} />
							</button>
						)}
						<button
							aria-label={`Buy ${record.title} by ${record.artistName.join(" & ")}`}
							className="buy-button"
							onClick={(e) => {
								e.stopPropagation();
								handleBuyNow({
									id: record.id,
									title: record.title,
									artistName: record.artistName,
									price: record.price,
									coverImage: record.coverImageUrl,
								});
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

	// Pagination handling
	const totalPages = Math.ceil(total / pageSize);
	const prevPage = () => setPage((p) => Math.max(p - 1, 1));
	const nextPage = () => setPage((p) => p + 1);

	return (
		<div className="content-box-grid">
			<fieldset>
				<legend className="sr-only">Filter records</legend>
				<div className="filter-menu">
					<button
						className="filter-toggle"
						onClick={() => setFiltersOpen(!filtersOpen)}
					>
						{filtersOpen ? "Close Filters" : "Show Filters"}
					</button>
					<div className={`filter-controls ${filtersOpen ? "open" : ""}`}>
						<select
							aria-label="Filter results by artist"
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
							aria-label="Filter results by genre"
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
							aria-label="Filter results by decade of release"
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
							aria-label="Filter results by condition of record"
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
						aria-label="Select the ordering of the records"
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
			</fieldset>

			<div aria-live="polite" aria-busy={loading} className="records-grid">
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
