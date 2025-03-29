"use client";
import { useState } from "react";

const vinylConditions = ["Mint", "Near Mint", "Very Good", "Good", "Fair"];

type AddRecordFormData = {
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
	coverImage: File | undefined;
};

export default function AddRecordPage() {
	const [form, setForm] = useState<AddRecordFormData>({
		title: "",
		artistName: [""],
		releaseYear: "",
		genre: [""],
		label: "",
		price: "",
		catalogueNumber: "",
		vinylCondition: "Mint",
		sleeveCondition: "Mint",
		description: "",
		coverImage: undefined,
	});

	const [status, setStatus] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setForm((prev) => ({ ...prev, coverImage: file }));
	};

	const handleArrayChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		key: "artistName" | "genre",
		index: number
	) => {
		const newArray = [...form[key]];
		newArray[index] = e.target.value;
		setForm((prev) => ({ ...prev, [key]: newArray }));
	};

	const addArrayField = (key: "artistName" | "genre") => {
		setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setStatus(null);

		try {
			const res = await fetch("/api/add-record", {
				method: "POST",
				body: toFormData(form),
			});

			if (res.ok) {
				setStatus("Record added successfully!");
				alert("✅ Record added successfully.");

				setForm({
					title: "",
					artistName: [""],
					releaseYear: "",
					genre: [""],
					label: "",
					price: "",
					catalogueNumber: "",
					vinylCondition: "Mint",
					sleeveCondition: "Mint",
					description: "",
					coverImage: undefined,
				});
			} else {
				const error = await res.text();
				setStatus(`Error: ${error}`);
			}
		} catch {
			setStatus("Failed to submit.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="admin-form-container">
			<h1 className="admin-form-title">Add New Vinyl Record</h1>
			<form onSubmit={handleSubmit} className="admin-form">
				<input
					name="title"
					placeholder="Title"
					value={form.title}
					onChange={handleChange}
					required
					className="w-full border p-2"
				/>

				{form.artistName.map((artist, i) => (
					<input
						key={i}
						value={artist}
						onChange={(e) => handleArrayChange(e, "artistName", i)}
						placeholder={`Artist ${i + 1}`}
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
					placeholder="Release Year"
					value={form.releaseYear}
					onChange={handleChange}
					required
					className="w-full border p-2"
				/>

				{form.genre.map((g, i) => (
					<input
						key={i}
						value={g}
						onChange={(e) => handleArrayChange(e, "genre", i)}
						placeholder={`Genre ${i + 1}`}
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
					placeholder="Record Label"
					value={form.label}
					onChange={handleChange}
					className="w-full border p-2"
				/>

				<input
					name="price"
					type="number"
					step="0.01"
					placeholder="Price"
					value={form.price}
					onChange={handleChange}
					required
					className="w-full border p-2"
				/>

				<input
					name="catalogueNumber"
					placeholder="Catalogue Number"
					value={form.catalogueNumber}
					onChange={handleChange}
					className="w-full border p-2"
				/>

				<select
					name="vinylCondition"
					value={form.vinylCondition}
					onChange={handleChange}
					className="w-full border p-2"
				>
					{vinylConditions.map((cond) => (
						<option key={cond}>{cond}</option>
					))}
				</select>

				<select
					name="sleeveCondition"
					value={form.sleeveCondition}
					onChange={handleChange}
					className="w-full border p-2"
				>
					{vinylConditions.map((cond) => (
						<option key={cond}>{cond}</option>
					))}
				</select>

				<textarea
					name="description"
					value={form.description}
					onChange={handleChange}
					placeholder="Description"
					className="w-full border p-2"
					rows={4}
				/>

				<input
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className="w-full"
					required
				/>

				<button type="submit" disabled={submitting}>
					{submitting ? "Submitting..." : "Submit"}
				</button>
				{status && <p className="admin-status">{status}</p>}
			</form>
		</div>
	);
}

function toFormData(form: AddRecordFormData): FormData {
	const formData = new FormData();
	formData.append("title", form.title);
	form.artistName.forEach((a) => formData.append("artistName[]", a));
	formData.append("releaseYear", form.releaseYear);
	form.genre.forEach((g) => formData.append("genre[]", g));
	formData.append("label", form.label);
	formData.append("price", form.price);
	formData.append("catalogueNumber", form.catalogueNumber);
	formData.append("vinylCondition", form.vinylCondition);
	formData.append("sleeveCondition", form.sleeveCondition);
	formData.append("description", form.description);
	if (form.coverImage) {
		formData.append("coverImage", form.coverImage);
	}
	return formData;
}
