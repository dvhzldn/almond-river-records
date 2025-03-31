"use client";

import Link from "next/link";

export default function AdminHomePage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

			<ul className="space-y-4">
				<li>
					<Link
						href="/admin/addrecord"
						className="text-blue-600 hover:underline text-lg"
					>
						➕ Add New Record
					</Link>
				</li>

				<li>
					<Link
						href="/admin/manage-records"
						className="text-blue-600 hover:underline text-lg"
					>
						📦 Manage Records
					</Link>
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
