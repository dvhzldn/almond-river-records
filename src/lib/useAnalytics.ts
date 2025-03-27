"use client";

declare global {
	interface Window {
		umami?: {
			track: (
				eventName: string,
				data?: Record<string, string | number>
			) => void;
		};
	}
}

export function useAnalytics() {
	const track = (
		eventName: string,
		data?: Record<string, string | number>
	) => {
		if (typeof window !== "undefined" && window.umami) {
			window.umami.track(eventName, data);
		}
	};

	return { track };
}
