"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";

interface Album {
	id: string;
	title: string;
	artist_names: string[];
	cover_image_url?: string | null;
	description?: Document | string;
}

export default function AlbumOfTheWeek() {
	const [album, setAlbum] = useState<Album | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAlbum() {
			try {
				const res = await fetch("/api/album-of-the-week");
				if (!res.ok) throw new Error("Failed to fetch album");
				const data = await res.json();
				setAlbum(data);
			} catch (err) {
				console.error("Failed to load album:", err);
			} finally {
				setLoading(false);
			}
		}
		fetchAlbum();
	}, []);

	if (loading) return <p>Loading Album of the Week...</p>;
	if (!album) return <p>No album available at this time.</p>;

	return (
		<div className="featured-record">
			<div className="featured-record-details">
				<h3>
					{album.title} by {album.artist_names.join(" & ")}
				</h3>
				<div>
					{album.description ? (
						typeof album.description === "object" ? (
							documentToReactComponents(album.description as Document)
						) : (
							<p>{album.description}</p>
						)
					) : null}
				</div>
			</div>

			<div className="record-image-container">
				{album.cover_image_url ? (
					<Image
						src={album.cover_image_url}
						alt={`Album cover for ${album.title}`}
						width={400}
						height={400}
						className="featured-record-cover"
						sizes="(max-width: 768px) 100vw, 250px"
						quality={60}
						loading="lazy"
					/>
				) : (
					<p>No cover image available.</p>
				)}
			</div>
		</div>
	);
}
