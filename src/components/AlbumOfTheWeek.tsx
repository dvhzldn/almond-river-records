"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";

interface Album {
	id: string;
	title: string;
	artist_names: string[];
	cover_image_asset?: { id: string; url: string }[];
	description?: Document | string;
}

// Robust helper function to extract and normalize the cover image URL.
const getCoverImageUrl = (cover: unknown): string | null => {
	if (!cover) return null;
	if (Array.isArray(cover)) {
		if (cover.length === 0) return null;
		const first = cover[0];
		// Ensure the first element exists and has a "url" property.
		if (first && typeof first === "object" && "url" in first) {
			const url = (first as { url: string }).url;
			return typeof url === "string"
				? url.startsWith("//")
					? "https:" + url
					: url
				: null;
		}
		return null;
	}
	if (typeof cover === "object" && "url" in cover) {
		const url = (cover as { url: string }).url;
		return typeof url === "string"
			? url.startsWith("//")
				? "https:" + url
				: url
			: null;
	}
	return null;
};

export default function AlbumOfTheWeek() {
	const [album, setAlbum] = useState<Album | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchAlbum() {
			try {
				const { data, error } = await supabase
					.from("vinyl_records")
					.select(
						`
            id,
            title,
            artist_names,
            description,
            cover_image_asset:contentful_assets!vinyl_records_cover_image_fkey (
              id,
              url
            )
          `
					)
					.eq("album_of_the_week", true)
					.single();

				if (error) throw error;
				if (data) setAlbum(data);
			} catch (err) {
				console.error("Error fetching album of the week:", err);
			} finally {
				setLoading(false);
			}
		}
		fetchAlbum();
	}, []);

	if (loading) return <p>Loading Album of the Week...</p>;
	if (!album) return <p>No album available at this time.</p>;

	const coverImageUrl = getCoverImageUrl(album.cover_image_asset);

	return (
		<section className="album-of-the-week">
			<h2>Album of the Week</h2>
			<div className="featured-record">
				<div className="featured-record-details">
					<h3>
						{album.title} by {album.artist_names.join(", ")}
					</h3>
					<div>
						{album.description ? (
							typeof album.description === "object" ? (
								documentToReactComponents(album.description as Document)
							) : (
								<p>{album.description}</p>
							)
						) : (
							<p>No description available.</p>
						)}
					</div>
				</div>
				<div className="record-image-container">
					{coverImageUrl ? (
						<Image
							src={coverImageUrl}
							alt={album.title}
							className="featured-record-cover"
							width={400}
							height={400}
						/>
					) : (
						<p>No cover image available.</p>
					)}
				</div>
			</div>
		</section>
	);
}
