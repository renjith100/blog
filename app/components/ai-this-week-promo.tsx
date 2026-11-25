import {
	formatWeekRange,
	getCurrentWeekStart,
	getWeeks,
} from "app/weekly/utils";
import { EXPLAINER_POST } from "app/weekly/week-view";
import Link from "next/link";

/**
 * A card that sends readers to AI This Week (/weekly), showing the latest
 * week that has updates: its dates, how many updates, and its one-line
 * summary. Shown on the home page and under every blog post.
 *
 * The card itself isn't clickable. The headline and the "Catch up on the
 * week" button go to /weekly, and a small "What is this?" in the top-right
 * corner goes to the explainer post.
 *
 * Renders nothing until the first week has content.
 */
export function AiThisWeekPromo() {
	// Skip weeks staged ahead of time, so the card matches what /weekly opens on
	const current = getCurrentWeekStart();
	const latest = getWeeks()
		.filter((week) => week.start <= current)
		.at(-1);
	if (!latest) {
		return null;
	}
	const count = latest.updates.length;

	return (
		<div className="my-12 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<p className="text-xs font-semibold uppercase tracking-wider text-sky-500">
					AI This Week · {formatWeekRange(latest.start)}
				</p>
				<Link
					href={`/blog/${EXPLAINER_POST}`}
					className="text-sm text-neutral-500 underline underline-offset-4 hover:text-sky-600 dark:text-neutral-400 dark:hover:text-sky-400"
				>
					What is this?
				</Link>
			</div>
			<p className="mt-2 text-lg font-semibold">
				<Link
					href="/weekly"
					className="underline-offset-4 hover:text-sky-600 hover:underline dark:hover:text-sky-400"
				>
					{count} AI {count === 1 ? "launch" : "launches"} that mattered, in
					plain English
				</Link>
			</p>
			{latest.summary && (
				<p className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
					{latest.summary}
				</p>
			)}
			<Link
				href="/weekly"
				className="mt-4 inline-flex min-h-11 items-center rounded-full bg-sky-600 px-5 text-base font-semibold text-white transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:text-neutral-950 dark:hover:bg-sky-400"
			>
				Catch up on the week →
			</Link>
		</div>
	);
}
