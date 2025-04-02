"use client";
import { useState } from "react";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";

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

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// Function to resize and crop the image to 800x800 px
	const resizeAndCropImage = (
		file: File,
		maxWidth: number,
		maxHeight: number
	): Promise<File> => {
		return new Promise((resolve, reject) => {
			const img = document.createElement("img");
			const reader = new FileReader();

			reader.onload = () => {
				img.src = reader.result as string;
			};

			reader.onerror = reject;
			reader.readAsDataURL(file);

			img.onload = () => {
				// Resize logic: scale the image
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				// Resize to fit within maxWidth and maxHeight, keeping aspect ratio
				let width = img.width;
				let height = img.height;

				if (width > maxWidth || height > maxHeight) {
					const scale = Math.min(maxWidth / width, maxHeight / height);
					width = width * scale;
					height = height * scale;
				}

				// Set canvas size to fit the resized image
				canvas.width = width;
				canvas.height = height;

				// Draw the image onto the canvas
				ctx?.drawImage(img, 0, 0, width, height);

				// Crop the image to make it square (center crop)
				const cropSize = Math.min(width, height);
				const offsetX = (width - cropSize) / 2;
				const offsetY = (height - cropSize) / 2;

				const croppedCanvas = document.createElement("canvas");
				const croppedCtx = croppedCanvas.getContext("2d");
				croppedCanvas.width = cropSize;
				croppedCanvas.height = cropSize;

				// Draw the cropped part of the image onto the new canvas
				croppedCtx?.drawImage(
					canvas,
					offsetX,
					offsetY,
					cropSize,
					cropSize,
					0,
					0,
					cropSize,
					cropSize
				);

				// Convert the canvas to a Blob
				croppedCanvas.toBlob(
					(blob) => {
						if (blob) {
							// Convert Blob to File (you'll need to provide a name and lastModified)
							const fileName = file.name || "image.jpg"; // Default file name if not provided
							const fileObj = new File([blob], fileName, {
								type: "image/jpeg",
								lastModified: Date.now(),
							});

							resolve(fileObj); // Resolve with the File object
						} else {
							reject(new Error("Failed to convert canvas to Blob"));
						}
					},
					"image/jpeg",
					0.8
				);
			};
		});
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Resize and crop the image before setting it
			const resizedBlob = await resizeAndCropImage(file, 800, 800);
			const resizedUrl = URL.createObjectURL(resizedBlob);

			setForm((prev) => ({ ...prev, coverImage: resizedBlob }));
			setImagePreview(resizedUrl); // Set the preview to the resized and cropped image
		}
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
		<div className="page-container">
			<Link href="/admin/home">← Back to Admin</Link>
			<div className="admin-form-container">
				<h1 className="admin-form-title">Add New Record</h1>
				<form onSubmit={handleSubmit} className="admin-form">
					<input
						name="title"
						placeholder="Title of release (e.g. Abbey Road)"
						value={form.title}
						onChange={handleChange}
						required
					/>

					{form.artistName.map((artist, i) => (
						<input
							key={i}
							value={artist}
							onChange={(e) => handleArrayChange(e, "artistName", i)}
							placeholder={`Name of artist ${i + 1}`}
							required
						/>
					))}
					<button
						type="button"
						onClick={() => addArrayField("artistName")}
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
					/>

					{form.genre.map((g, i) => (
						<input
							key={i}
							value={g}
							onChange={(e) => handleArrayChange(e, "genre", i)}
							placeholder={`Genre ${i + 1}`}
						/>
					))}
					<button type="button" onClick={() => addArrayField("genre")}>
						+ Add Genre
					</button>

					<input
						name="label"
						placeholder="Record Label"
						required
						value={form.label}
						onChange={handleChange}
					/>

					<input
						name="catalogueNumber"
						placeholder="Catalogue Number"
						value={form.catalogueNumber}
						onChange={handleChange}
						required
					/>

					<input
						name="price"
						type="number"
						step="1"
						placeholder="Price"
						value={form.price}
						onChange={handleChange}
						required
					/>
					<p>Vinyl Condition</p>
					<select
						name="vinylCondition"
						value={form.vinylCondition}
						onChange={handleChange}
					>
						{vinylConditions.map((cond) => (
							<option key={cond}>{cond}</option>
						))}
					</select>
					<p>Record Sleeve Condition</p>

					<select
						name="sleeveCondition"
						value={form.sleeveCondition}
						onChange={handleChange}
					>
						{vinylConditions.map((cond) => (
							<option key={cond}>{cond}</option>
						))}
					</select>

					<textarea
						name="description"
						value={form.description}
						onChange={handleChange}
						placeholder="Description of the release (used for Album Of The Week)"
						rows={4}
					/>
					<p>Attach a cover image</p>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						onChange={handleFileChange}
						required
					/>

					{imagePreview && (
						<div style={{ marginTop: "1rem" }}>
							<Image
								src={imagePreview}
								alt="Cover preview"
								width={400}
								height={400}
								sizes="(max-width: 768px) 100vw, 250px"
								quality={60}
								loading="lazy"
								style={{
									maxWidth: "100%",
									borderRadius: "8px",
									marginBottom: "0.5rem",
									height: "auto",
								}}
							/>
							<button
								type="button"
								onClick={() => {
									setForm((prev) => ({
										...prev,
										coverImage: undefined,
									}));
									setImagePreview(null);
									if (fileInputRef.current)
										fileInputRef.current.value = "";
								}}
								className="clear-button"
							>
								Remove Image
							</button>
						</div>
					)}

					<button type="submit" disabled={submitting}>
						{submitting ? "Submitting..." : "Submit"}
					</button>
					{status && <p className="admin-status">{status}</p>}
				</form>
			</div>
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
