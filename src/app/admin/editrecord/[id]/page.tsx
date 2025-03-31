"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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
};

export default function EditRecordPage() {
	const router = useRouter();
	const params = useParams();
	const recordId = params.id as string;

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
				setForm(data);
			} catch (err) {
				console.error("Failed to load record", err);
				setStatus("Failed to load record.");
			}
		};

		fetchRecord();
	}, [recordId]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		if (!form) return;
		setForm({ ...form, [name]: value });
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

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!form || !file) return;

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

		try {
			const res = await fetch("/api/edit-record", {
				method: "POST",
				body: formData,
			});

			if (res.ok) {
				setStatus("✅ Record updated.");
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
			<h1 className="admin-form-title">Edit Record</h1>
			<form onSubmit={handleSubmit} className="admin-form">
				<input
					name="title"
					value={form.title}
					onChange={handleChange}
					className="w-full border p-2"
				/>

				{form.artistName.map((artist, i) => (
					<input
						key={i}
						value={artist}
						onChange={(e) => handleArrayChange(e, "artistName", i)}
						className="w-full border p-2"
					/>
				))}
				<button
					type="button"
					onClick={() => addArrayField("artistName")}
					className="text-blue-600"
				>
					+ Add Artist
				</button>

				<input
					name="releaseYear"
					type="number"
					value={form.releaseYear}
					onChange={handleChange}
					className="w-full border p-2"
				/>

				{form.genre.map((genre, i) => (
					<input
						key={i}
						value={genre}
						onChange={(e) => handleArrayChange(e, "genre", i)}
						className="w-full border p-2"
					/>
				))}
				<button
					type="button"
					onClick={() => addArrayField("genre")}
					className="text-blue-600"
				>
					+ Add Genre
				</button>

				<input
					name="label"
					value={form.label}
					onChange={handleChange}
					className="w-full border p-2"
				/>
				<input
					name="catalogueNumber"
					value={form.catalogueNumber}
					onChange={handleChange}
					className="w-full border p-2"
				/>
				<input
					name="price"
					type="number"
					value={form.price}
					onChange={handleChange}
					className="w-full border p-2"
				/>

				<select
					name="vinylCondition"
					value={form.vinylCondition}
					onChange={handleChange}
					className="w-full border p-2"
				>
					{vinylConditions.map((v) => (
						<option key={v}>{v}</option>
					))}
				</select>

				<select
					name="sleeveCondition"
					value={form.sleeveCondition}
					onChange={handleChange}
					className="w-full border p-2"
				>
					{vinylConditions.map((v) => (
						<option key={v}>{v}</option>
					))}
				</select>

				<textarea
					name="description"
					value={form.description}
					onChange={handleChange}
					className="w-full border p-2"
					rows={4}
				/>

				{form.coverImageUrl && !form.coverImageFile && (
					<Image
						src={form.coverImageUrl}
						alt="Current Cover"
						width={200}
						height={200}
						className="rounded mb-2"
					/>
				)}
				<input
					type="file"
					accept="image/*"
					ref={fileInputRef}
					onChange={handleFileChange}
					className="w-full"
				/>

				<button type="submit" disabled={submitting}>
					{submitting ? "Updating..." : "Update Record"}
				</button>
				{status && <p className="admin-status">{status}</p>}
			</form>
		</div>
	);
}
