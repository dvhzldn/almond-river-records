interface TrackListProps {
	tracklist: string[];
}

export default function TrackList({ tracklist }: TrackListProps) {
	if (!tracklist.length) return null;

	return (
		<div className="tracklist">
			<h4>Track Listing</h4>
			<ol>
				{tracklist.map((track, index) => (
					<li key={index}>{track}</li>
				))}
			</ol>
		</div>
	);
}
