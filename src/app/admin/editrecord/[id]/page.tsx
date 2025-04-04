"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const vinylConditions = ["Mint", "Near Mint", "Very Good", "Good", "Fair"];

type RecordFormData = {
	id: string;
	title: string;
	artistName: string[];
	releaseYear: string;
	genre: string[];
	label: string;
	price: string;
	catalogueNumber: string;
	vinylCondition: string;
	sleeveCondition: string;
	description: string;
	coverImageUrl?: string;
	coverImageFile?: File;
	albumOfTheWeek?: boolean;
};

export default function EditRecordPage() {
	const params = useParams();
	const recordId = params.id as string;
	const router = useRouter();

	const [form, setForm] = useState<RecordFormData | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const fetchRecord = async () => {
			if (!recordId) return;

			try {
				const res = await fetch(`/api/get-record?id=${recordId}`);
				const data = await res.json();
				if (data) {
					setForm({
						...data,
						albumOfTheWeek: data.albumOfTheWeek ?? false,
					});
				}
			} catch (err) {
				console.error("Failed to load record", err);
				setStatus("Failed to load record.");
			}
		};

		fetchRecord();
	}, [recordId]);

	const handleChange = (
		e: React.ChangeEvent<HTMLElement & { name: string; value: string }>
	) => {
		if (!form) return;
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleArrayChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		key: "artistName" | "genre",
		index: number
	) => {
		if (!form) return;
		const updated = [...form[key]];
		updated[index] = e.target.value;
		setForm({ ...form, [key]: updated });
	};

	const addArrayField = (key: "artistName" | "genre") => {
		if (!form) return;
		setForm({ ...form, [key]: [...form[key], ""] });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!form) return;
		const file = e.target.files?.[0];
		setForm({ ...form, coverImageFile: file });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form) return;

		setSubmitting(true);
		setStatus(null);

		const formData = new FormData();
		formData.append("id", form.id);
		formData.append("title", form.title);
		form.artistName.forEach((a) => formData.append("artistName[]", a));
		form.genre.forEach((g) => formData.append("genre[]", g));
		formData.append("releaseYear", form.releaseYear);
		formData.append("label", form.label);
		formData.append("catalogueNumber", form.catalogueNumber);
		formData.append("price", form.price);
		formData.append("vinylCondition", form.vinylCondition);
		formData.append("sleeveCondition", form.sleeveCondition);
		formData.append("description", form.description);
		if (form.coverImageFile) {
			formData.append("coverImage", form.coverImageFile);
		}

		formData.append("albumOfTheWeek", form.albumOfTheWeek ? "true" : "false");

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setStatus("You must be logged in to update a record.");
				return;
			}

			const res = await fetch("/api/edit-record", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				body: formData,
			});

			if (res.ok) {
				setStatus("✅ Record updated.");
				alert(`✅ ${form.artistName.join(", ")} - ${form.title} updated`);

				router.push("/admin/manage-records");
			} else {
				setStatus("❌ Failed to update.");
			}
		} catch (err) {
			console.error("Error submitting:", err);
			setStatus("Error submitting.");
		} finally {
			setSubmitting(false);
		}
	};

	if (!form) return <p>Loading...</p>;

	return (
		<div className="admin-form-container">
			<Link href="/admin/manage-records">← Back to Manage Records</Link>

			<h1 className="admin-form-title">Edit Record</h1>
			<form onSubmit={handleSubmit} className="admin-form">
				<label>
					Title
					<input name="title" value={form.title} onChange={handleChange} />
				</label>

				{form.artistName.map((artist, i) => (
					<label key={i}>
						Artist {i + 1}
						<input
							value={artist}
							onChange={(e) => handleArrayChange(e, "artistName", i)}
						/>
					</label>
				))}
				<button type="button" onClick={() => addArrayField("artistName")}>
					+ Add Artist
				</button>

				<label>
					Release Year
					<input
						name="releaseYear"
						type="number"
						value={form.releaseYear}
						onChange={handleChange}
					/>
				</label>

				{form.genre.map((genre, i) => (
					<label key={i}>
						Genre {i + 1}
						<input
							value={genre}
							onChange={(e) => handleArrayChange(e, "genre", i)}
						/>
					</label>
				))}
				<button type="button" onClick={() => addArrayField("genre")}>
					+ Add Genre
				</button>

				<label>
					Label
					<input name="label" value={form.label} onChange={handleChange} />
				</label>

				<label>
					Catalogue Number
					<input
						name="catalogueNumber"
						value={form.catalogueNumber}
						onChange={handleChange}
					/>
				</label>

				<label>
					Price
					<input
						name="price"
						type="number"
						value={form.price}
						onChange={handleChange}
					/>
				</label>

				<label>
					Vinyl Condition
					<select
						name="vinylCondition"
						value={form.vinylCondition}
						onChange={handleChange}
					>
						{vinylConditions.map((v) => (
							<option key={v}>{v}</option>
						))}
					</select>
				</label>

				<label>
					Sleeve Condition
					<select
						name="sleeveCondition"
						value={form.sleeveCondition}
						onChange={handleChange}
					>
						{vinylConditions.map((v) => (
							<option key={v}>{v}</option>
						))}
					</select>
				</label>

				<label>
					Album of the Week
					<select
						name="albumOfTheWeek"
						value={form.albumOfTheWeek ? "true" : "false"}
						onChange={(e) =>
							setForm({
								...form,
								albumOfTheWeek: e.target.value === "true",
							})
						}
					>
						<option value="false">No</option>
						<option value="true">Yes</option>
					</select>
				</label>

				<label>
					Description
					<textarea
						name="description"
						value={form.description}
						onChange={handleChange}
						rows={4}
					/>
				</label>

				{form.coverImageUrl && !form.coverImageFile && (
					<Image
						src={form.coverImageUrl}
						alt="Current Cover"
						width={200}
						height={200}
						quality={60}
						loading="lazy"
					/>
				)}

				<label>
					Replace Cover Image
					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleFileChange}
					/>
				</label>

				<button type="submit" disabled={submitting}>
					{submitting ? "Updating..." : "Update Record"}
				</button>

				{status && <p>{status}</p>}
			</form>
		</div>
	);
}
