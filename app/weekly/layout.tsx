import type { Metadata } from "next";

/**
 * Weekly embeds X posts, and react-tweet plays their videos straight from
 * video.twimg.com, which answers 403 to any Referer other than x.com.
 * Sending the referrer only to our own origin lets those videos play,
 * while links and requests within the site keep theirs.
 */
export const metadata: Metadata = {
	referrer: "same-origin",
};

export default function WeeklyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
