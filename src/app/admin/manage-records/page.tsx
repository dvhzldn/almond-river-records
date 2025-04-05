"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash.debounce";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type VinylRecord = {
	id: string;
	title: string;
	artistName: string[];
	coverImageUrl?: string;
	price: number;
};

const PAGE_SIZE = 24;

export default function ManageRecordsPage() {
	const [status, setStatus] = useState<string | null>(null);
	const [records, setRecords] = useState<VinylRecord[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const fetchSessionAndRecords = useCallback(async () => {
		setLoading(true);
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			setStatus("You must be logged in to manage records.");
			router.replace("/login");
			return;
		}

		try {
			const skip = (currentPage - 1) * PAGE_SIZE;
			const queryParams = new URLSearchParams({
				limit: PAGE_SIZE.toString(),
				skip: skip.toString(),
			});
			if (searchTerm.trim()) {
				queryParams.append("search", searchTerm.trim());
			}

			const res = await fetch(`/api/get-records?${queryParams.toString()}`, {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!res.ok) throw new Error("Failed to fetch records");
			const data = await res.json();
			setRecords(data.records);
			setTotalCount(data.total);
		} catch (err) {
			console.error("[Fetch Error]", err);
			setError("Could not load records.");
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchTerm, router]);

	useEffect(() => {
		fetchSessionAndRecords();
	}, [fetchSessionAndRecords]);

	const handleArchive = async (
		id: string,
		title: string,
		artist: string[]
	) => {
		const confirmed = confirm("Delete this record?");
		if (!confirmed) return;

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setStatus("You must be logged in to delete a record.");
				return;
			}

			const res = await fetch(`/api/delete-record?id=${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});
			if (!res.ok) throw new Error("Deletion failed");

			alert(`${artist.join(" & ")} - ${title} has been deleted.`);
			fetchSessionAndRecords(); // Refresh the page
		} catch (err) {
			console.error("[Deletion Error]", err);
			alert("❌ Failed to delete record.");
		}
	};

	const totalPages = Math.ceil(totalCount / PAGE_SIZE);

	// Debounced search input handler
	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				setCurrentPage(1);
				setSearchTerm(value);
			}, 400),
		[]
	);

	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	// Call this from input:
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		debouncedSearch(e.target.value);
	};

	return (
		<div className="page-container">
			<Link href="/admin/home">← Back to Admin</Link>
			<h1>Manage Records</h1>
			{loading && <p>Loading...</p>}
			{error && <p className="text-red-600">{error}</p>}
			{status && <p className="status-message">{status}</p>}

			<div className="my-4">
				<input
					type="text"
					placeholder="Search by title or artist..."
					className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2"
					onChange={handleSearchChange}
				/>
			</div>

			{records.length === 0 && !loading ? (
				<p>No records found.</p>
			) : (
				<>
					<div className="overflow-x-auto">
						<table>
							<thead>
								<tr>
									<th></th>
									<th>Cover</th>
									<th>Title</th>
									<th>Artist(s)</th>
									<th>Price</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{records.map((record) => (
									<tr className="text" key={record.id}>
										<td>
											<Link
												className="form-button"
												href={`/admin/editrecord/${record.id}`}
											>
												Edit
											</Link>
										</td>
										<td>
											{record.coverImageUrl ? (
												<Image
													src={record.coverImageUrl}
													alt={record.title}
													width={40}
													height={40}
													sizes="(max-width: 768px) 100vw, 250px"
													quality={60}
													loading="lazy"
												/>
											) : (
												<span>No Image</span>
											)}
										</td>
										<td>{record.title}</td>
										<td>{record.artistName.join(" & ")}</td>
										<td>{record.price}</td>
										<td>
											<button
												className="basket-button"
												onClick={() =>
													handleArchive(
														record.id,
														record.title,
														record.artistName
													)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination Controls */}
					<div className="mt-4 flex justify-center gap-4">
						<button
							className="form-button"
							onClick={() =>
								setCurrentPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={currentPage === 1}
						>
							← Prev
						</button>
						<span>
							Page {currentPage} of {totalPages}
						</span>
						<button
							className="form-button"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Next →
						</button>
					</div>
				</>
			)}
		</div>
	);
}
