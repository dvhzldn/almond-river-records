"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

	useEffect(() => {
		const fetchRecords = async () => {
			try {
				const res = await fetch("/api/get-records");
				if (!res.ok) throw new Error("Failed to fetch records");
				const data = await res.json();
				setRecords(data);
			} catch (err) {
				console.error("[Fetch Error]", err);
				setError("Could not load records.");
			} finally {
				setLoading(false);
			}
		};

		fetchRecords();
	}, []);

	const handleArchive = async (id: string) => {
		const confirmed = confirm("Archive this record?");
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/delete-record?id=${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Archive failed");
			setRecords((prev) => prev.filter((r) => r.id !== id));
		} catch (err) {
			console.error("[Archive Error]", err);
			alert("❌ Failed to archive record.");
		}
	};

	return (
		<div className="page-container">
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
								<th>Cover</th>
								<th>Title</th>
								<th>Artist(s)</th>
								<th>Price</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{records.map((record) => (
								<tr className="text" key={record.id}>
									<td>
										{record.coverImageUrl ? (
											<Image
												src={record.coverImageUrl}
												alt={record.title}
												width={40}
												height={40}
											/>
										) : (
											<span>No Image</span>
										)}
									</td>
									<td>{record.title}</td>
									<td>{record.artistName.join(", ")}</td>
									<td>{record.price}</td>
									<td>
										<Link href={`/admin/editrecord/${record.id}`}>
											Edit
										</Link>{" "}
										<button onClick={() => handleArchive(record.id)}>
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
