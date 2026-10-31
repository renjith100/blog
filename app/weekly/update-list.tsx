import type { Week } from "app/weekly/utils";
import Link from "next/link";
import { SourceIcon } from "./sources";

function formatWeekday(date: string) {
	return new Date(`${date}T00:00:00Z`).toLocaleString("en-us", {
		timeZone: "UTC",
		weekday: "short",
	});
}

/**
 * Rows for a week's updates, newest first: icon, source, title and weekday.
 * Each row links to ?id=<slug>, which opens that update's popup.
 *
 * @param week - The week being shown, from getWeek()
 */
export function UpdateList({ week }: { week: Week }) {
	if (week.updates.length === 0) {
		return (
			<p className="text-base text-neutral-500 dark:text-neutral-400">
				Nothing yet this week.
			</p>
		);
	}

	return (
		<ul className="divide-y divide-neutral-200 overflow-hidden rounded-md border border-neutral-200 text-base dark:divide-neutral-800 dark:border-neutral-800">
			{week.updates.map((update) => (
				<li key={update.slug}>
					<Link
						href={`?id=${update.slug}`}
						scroll={false}
						className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
					>
						<SourceIcon source={update.source} />
						<span className="hidden w-28 shrink-0 truncate text-sm text-neutral-500 sm:block dark:text-neutral-400">
							{update.source}
						</span>
						<span className="min-w-0 flex-1 truncate font-medium">
							{update.title}
						</span>
						<span className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
							{formatWeekday(update.date)}
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
