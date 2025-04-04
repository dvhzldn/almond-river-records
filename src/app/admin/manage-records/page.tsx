"use client";

import { useEffect, useState } from "react";
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

export default function ManageRecordsPage() {
	const [records, setRecords] = useState<VinylRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const checkAuthAndFetchRecords = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.replace("/login");
				return;
			}

			try {
				const res = await fetch("/api/get-records", {
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				});
				if (!res.ok) throw new Error("Failed to fetch records");
				const data = await res.json();
				setRecords(data.records);
			} catch (err) {
				console.error("[Fetch Error]", err);
				setError("Could not load records.");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndFetchRecords();
	}, [router]);

	// Archive (delete) a record and refresh the page
	const handleArchive = async (id: string) => {
		const confirmed = confirm("Delete this record?");
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/delete-record?id=${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});
			if (!res.ok) throw new Error("Deletion failed");

			// Refresh the page to get the updated list of records
			router.refresh(); // Trigger a page refresh and refetch the data
		} catch (err) {
			console.error("[Deletion Error]", err);
			alert("❌ Failed to delete record.");
		}
	};

	return (
		<div className="page-container">
			<Link href="/admin/home">← Back to Admin</Link>
			<h1>Manage Records</h1>
			{loading && <p>Loading...</p>}
			{error && <p className="text-red-600">{error}</p>}

			{records.length === 0 ? (
				<p>No records found.</p>
			) : (
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
											onClick={() => handleArchive(record.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
