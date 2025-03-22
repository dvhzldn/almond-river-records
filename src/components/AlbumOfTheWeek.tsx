"use client";

import React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import client from "@/lib/contentful";
import { IVinylRecordFields } from "@/@types/generated/contentful";
import { Document } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

// Adjusted type reflecting Contentful's entry sys structure.
type VinylRecordEntry = {
	sys: {
		id: string;
		contentType: {
			sys: {
				id: string;
			};
		};
	};
	fields: unknown;
};

interface Album {
	id: string;
	title: string;
	artistName: string[];
	coverImage: string | null;
	// Assuming description is stored as a rich text Document in Contentful.
	description?: Document;
}

export default function AlbumOfTheWeek() {
	const [album, setAlbum] = useState<Album | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchAlbum = async () => {
			try {
				// For testing, we use a hardcoded Contentful entry ID.
				const hardcodedEntryId = "43WkXtCZTJjEDvLsgmiupl";
				const res = await client.getEntry(hardcodedEntryId);
				const selected = res as VinylRecordEntry;
				const fields = selected.fields as IVinylRecordFields;

				const albumData: Album = {
					id: selected.sys.id,
					title: fields.title ?? "Unknown Title",
					artistName: fields.artistName ?? [],
					coverImage: fields.coverImage?.fields.file?.url
						? `https:${fields.coverImage.fields.file.url}?w=400&h=400&fit=thumb&fm=webp&q=80`
						: null,
					description: fields.description, // Assumes description is a Document.
				};

				setAlbum(albumData);
			} catch (error) {
				console.error("Error fetching album of the week:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAlbum();
	}, []);

	if (loading) {
		return <p>Loading Album of the Week...</p>;
	}

	if (!album) {
		return <p>No album available at this time.</p>;
	}

	return (
		<section className="album-of-the-week">
			<h2>Album of the Week</h2>
			<div className="featured-record">
				<div className="featured-record-details">
					<h3>
						{album.title} by {album.artistName}
					</h3>
					{album.description ? (
						<>{documentToReactComponents(album.description)}</>
					) : (
						<p>No description available.</p>
					)}
				</div>
				<div className="record-image-container">
					{album.coverImage && (
						<Image
							// className="responsive-image"
							src={album.coverImage}
							alt={album.title}
							className="featured-record-cover"
							width={400}
							height={400}
						/>
					)}
				</div>
			</div>
		</section>
	);
}
