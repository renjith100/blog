import type { Week } from "app/weekly/utils";
import { FiChevronDown } from "react-icons/fi";
import { SourceIcon } from "./sources";
import { UpdateAccordion } from "./update-accordion";
import { UpdateBody } from "./update-body";

function formatWeekday(date: string) {
	return new Date(`${date}T00:00:00Z`).toLocaleString("en-us", {
		timeZone: "UTC",
		weekday: "short",
	});
}

/**
 * A week's updates, newest first, as an accordion. Each row is a <details>
 * whose title bar shows icon, source, title and weekday; opening it shows
 * the update. All rows share one name, so only one is open at a time even
 * without JavaScript. The open row's title bar sticks to the top while you
 * read, so it can be closed from anywhere. The open styles use
 * `[open]:not([data-closing])`, so a closing row drops them at once. UpdateAccordion animates opening
 * and closing, scrolls an opened row to the top, and opens the row a link
 * points to (#<slug> or ?id=<slug>).
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
		<UpdateAccordion>
			<ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 text-base dark:divide-neutral-800 dark:border-neutral-800">
				{week.updates.map((update) => (
					<li key={update.slug}>
						<details
							id={update.slug}
							name="weekly-update"
							className="group scroll-mt-2"
						>
							<summary className="flex cursor-pointer touch-manipulation list-none items-center gap-3 bg-[var(--background)] px-3 py-2 transition-colors [-webkit-tap-highlight-color:transparent] [@media(hover:hover)]:hover:bg-neutral-50 dark:[@media(hover:hover)]:hover:bg-neutral-900 group-[[open]:not([data-closing])]:sticky group-[[open]:not([data-closing])]:top-0 group-[[open]:not([data-closing])]:z-10 group-[[open]:not([data-closing])]:border-b group-[[open]:not([data-closing])]:border-neutral-200 group-[[open]:not([data-closing])]:bg-neutral-50 group-[[open]:not([data-closing])]:py-3 dark:group-[[open]:not([data-closing])]:border-neutral-800 dark:group-[[open]:not([data-closing])]:bg-neutral-900 [&::-webkit-details-marker]:hidden">
								<SourceIcon source={update.source} />
								<span className="hidden w-28 shrink-0 truncate text-sm text-neutral-500 sm:block dark:text-neutral-400">
									{update.source}
								</span>
								<span className="min-w-0 flex-1 truncate font-medium group-[[open]:not([data-closing])]:whitespace-normal group-[[open]:not([data-closing])]:text-xl group-[[open]:not([data-closing])]:font-semibold group-[[open]:not([data-closing])]:leading-snug group-[[open]:not([data-closing])]:tracking-tight">
									{update.title}
								</span>
								<span className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
									{formatWeekday(update.date)}
								</span>
								<FiChevronDown
									aria-hidden
									className="shrink-0 text-neutral-400 transition-transform duration-300 group-[[open]:not([data-closing])]:rotate-180"
								/>
							</summary>
							<UpdateBody update={update} />
						</details>
					</li>
				))}
			</ul>
		</UpdateAccordion>
	);
}
