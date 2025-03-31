"use client";
import "@/app/globals.css";
import Link from "next/link";

export default function AdminHomePage() {
	return (
		<div>
			<h1>Admin Dashboard</h1>

			<ul>
				<li>
					<Link href="/admin/addrecord">➕ Add New Record</Link>
				</li>
				<br />
				<li>
					<Link href="/admin/manage-records">📦 Manage Records</Link>
				</li>

				{/* Future features
				<li>
					<Link href="/admin/orders" className="text-blue-600 hover:underline text-lg">
						🧾 View Orders
					</Link>
				</li>
				*/}
			</ul>
		</div>
	);
}
