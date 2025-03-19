import React from "react";

type SpotifyPlaylistProps = {
	playlistId: string; // Spotify Playlist ID
};

const SpotifyPlaylist: React.FC<SpotifyPlaylistProps> = ({ playlistId }) => {
	return (
		<div className="spotify-container">
			<iframe
				style={{ borderRadius: "12px" }}
				src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
				width="100%"
				height="352"
				frameBorder="0"
				allowFullScreen
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
				className="spotify-iframe"
			></iframe>
		</div>
	);
};

export default SpotifyPlaylist;
