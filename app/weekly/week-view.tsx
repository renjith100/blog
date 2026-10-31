import { Suspense } from "react";
import { UpdateDialog } from "./update-dialog";
import { UpdateList } from "./update-list";
import { UpdatePanel } from "./update-panel";
import {
	formatWeekRange,
	getCurrentWeekStart,
	getWeek,
	getWeeks,
} from "./utils";
import { WeekGrid } from "./week-grid";

export const TAGLINE = "What shipped in agents, week by week.";

/**
 * Formats a week as a full range for the date line.
 *
 * Example:
 * formatFullRange("2026-10-26", "2026-11-01") => "October 26 – November 1, 2026"
 */
function formatFullRange(start: string, end: string) {
	const format = (date: string, options: Intl.DateTimeFormatOptions) =>
		new Date(`${date}T00:00:00Z`).toLocaleString("en-us", {
			timeZone: "UTC",
			...options,
		});

	return `${format(start, { month: "long", day: "numeric" })} – ${format(end, {
		month: "long",
		day: "numeric",
		year: "numeric",
	})}`;
}

/**
 * Returns whether a week has a page: it must be a Monday that has updates,
 * or the current week (which has a page even before its first update).
 */
export function isWeekWithPage(start: string) {
	return (
		start === getCurrentWeekStart() ||
		getWeeks().some((week) => week.start === start)
	);
}

/**
 * The Weekly page for one week: heading and tagline, the week grid, then
 * the week's heading, summary, updates and their popups.
 * Used by both /weekly (the current week) and /weekly/[week].
 *
 * @param start - Monday of the week to show
 */
export function WeekView({ start }: { start: string }) {
	const weeks = getWeeks();
	const week = getWeek(start);
	const count = week.updates.length;

	return (
		<section>
			<h1>Weekly</h1>
			<p className="-mt-4 mb-8 text-lg text-neutral-600 dark:text-neutral-400">
				{TAGLINE} Pick a week to see what happened.
			</p>

			<WeekGrid
				weeks={weeks}
				current={getCurrentWeekStart()}
				selected={start}
			/>

			<div className="mb-4 mt-10">
				<h2 className="text-2xl font-semibold tracking-tight">
					Week of {formatWeekRange(start)}
				</h2>
				<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
					{formatFullRange(week.start, week.end)} · {count}{" "}
					{count === 1 ? "update" : "updates"}
				</p>
				{week.summary && <p className="mt-3 text-base">{week.summary}</p>}
			</div>

			<UpdateList week={week} />

			<Suspense fallback={null}>
				<UpdateDialog
					panels={Object.fromEntries(
						week.updates.map((update) => [
							update.slug,
							<UpdatePanel key={update.slug} update={update} />,
						]),
					)}
				/>
			</Suspense>
		</section>
	);
}
