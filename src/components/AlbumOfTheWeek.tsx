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
	cover_image_url?: string | null; // The cover image will be a URL string
	description?: Document | string;
}

export default function AlbumOfTheWeek() {
	const [album, setAlbum] = useState<Album | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchAlbum() {
			try {
				// First, fetch the album data from vinyl_records
				const { data, error } = await supabase
					.from("vinyl_records")
					.select(
						`
						id,
						title,
						artist_names,
						description,
						cover_image
					`
					)
					.eq("album_of_the_week", true)
					.order("updated_at", { ascending: false })
					.limit(1);

				if (error) {
					console.error("Error fetching vinyl record data:", error);
					throw error; // Rethrow error for further handling
				}

				if (data && data.length > 0) {
					const albumData = data[0];

					// Now, fetch the cover image based on the cover_image field
					const { data: coverImageData, error: coverError } =
						await supabase
							.from("contentful_assets")
							.select("url")
							.eq("id", albumData.cover_image)
							.single();

					if (coverError) {
						console.error("Error fetching cover image data:", coverError);
						throw coverError;
					}

					const coverImageUrl = coverImageData ? coverImageData.url : null;

					setAlbum({
						...albumData,
						cover_image_url: coverImageUrl,
					});
				}
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
							<p></p>
						)}
					</div>
				</div>
				<div className="record-image-container">
					{album.cover_image_url ? (
						<Image
							src={album.cover_image_url}
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
