"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { useRecords, VinylRecord } from "@/hooks/useRecords";
import { useSupabaseOptions } from "@/hooks/useSupabaseOptions";
import { useAddToBasket } from "@/hooks/useAddToBasket";
import { useRemoveFromBasket } from "@/hooks/useRemoveFromBasket";
import { useBasket } from "@/app/api/context/BasketContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";

export default function RecordsPage() {
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [condition, setCondition] = useState("");
	const [artist, setArtist] = useState("");
	const [genre, setGenre] = useState("");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [decade, setDecade] = useState("");
	const [page, setPage] = useState(1);
	const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(
		null
	);
	const pageSize = 24;

	const { artistOptions, genreOptions } = useSupabaseOptions();
	const { records, totalRecords, loading } = useRecords({
		search,
		condition,
		artist,
		decade,
		genre,
		page,
		pageSize,
	});

	const { handleAddToBasket } = useAddToBasket();
	const { handleRemoveFromBasket } = useRemoveFromBasket();
	const { basket } = useBasket();
	const router = useRouter();

	const nextPage = () => setPage((prev) => prev + 1);
	const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

	// Calculate total pages:
	const totalPages = Math.ceil(totalRecords / pageSize);

	const handleBuy = (record: VinylRecord, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering card onClick that opens Modal
		handleAddToBasket({
			id: record.id,
			title: record.title,
			artistName: record.artistName,
			price: record.price,
			coverImage: record.coverImage || "",
		});
		router.push("/basket");
	};

	// Determine if any filters have been applied.
	const filtersApplied =
		searchInput.trim() !== "" ||
		condition.trim() !== "" ||
		artist.trim() !== "" ||
		decade.trim() !== "" ||
		genre.trim() !== "";

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
					<select
						value={decade}
						onChange={(e) => {
							setDecade(e.target.value);
							setPage(1);
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
				{/* Only show "Clear Filters" if at least one filter is applied */}
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
													className="remove-button"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFromBasket(record.id);
													}}
												>
													{`Remove `}
													<FontAwesomeIcon
														icon={faShoppingBasket}
													/>
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
													Add{" "}
													<FontAwesomeIcon
														icon={faShoppingBasket}
													/>
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
			{totalPages > 1 && (
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
