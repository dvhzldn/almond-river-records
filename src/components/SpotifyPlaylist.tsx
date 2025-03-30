import React from "react";

type SpotifyPlaylistProps = {
	playlistId: string;
};

const SpotifyPlaylist: React.FC<SpotifyPlaylistProps> = ({ playlistId }) => {
	return (
		<div className="spotify-container">
			<iframe
				src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
				width="100%"
				height="352"
				allowFullScreen
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
				className="spotify-iframe"
				title="Spotify playlist player"
			></iframe>
			<p className="sr-only">
				Embedded Spotify playlist. If the player does not load, you can{" "}
				<a
					href={`https://open.spotify.com/playlist/${playlistId}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					open it directly on Spotify
				</a>
				.
			</p>
		</div>
	);
};

export default SpotifyPlaylist;
