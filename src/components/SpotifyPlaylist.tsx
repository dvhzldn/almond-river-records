import React from "react";

type SpotifyPlaylistProps = {
	playlistId: string;
};

const SpotifyPlaylist: React.FC<SpotifyPlaylistProps> = ({ playlistId }) => {
	return (
		<div className="spotify-container">
			<h2>What we are listening to</h2>
			<iframe
				src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
				width="100%"
				height="352"
				allowFullScreen
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
				className="spotify-iframe"
			></iframe>
		</div>
	);
};

export default SpotifyPlaylist;
