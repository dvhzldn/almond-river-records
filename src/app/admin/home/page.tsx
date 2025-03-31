"use client";
import "@/app/globals.css";
import Link from "next/link";

export default function AdminHomePage() {
	return (
		<div className="page-container">
			<h1>Admin Dashboard</h1>

			<hr />
			<ul>
				<li>
					<Link href="/admin/addrecord">➕ Add a new record</Link>
				</li>
				<br />
				<li>
					<Link href="/admin/manage-records">
						📦 Manage existing records
					</Link>
				</li>
			</ul>
		</div>
	);
}
