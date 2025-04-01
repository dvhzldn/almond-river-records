interface TrackListProps {
	tracklist: string[];
}

export default function TrackList({ tracklist }: TrackListProps) {
	if (!tracklist.length) return null;

	return (
		<div className="tracklist">
			<div className="tracklist-wrapper">
				<p className="tracklist-title">Track Listing</p>
				<ul className="tracklist-list">
					{tracklist.map((track, index) => (
						<li key={index}>{track}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
