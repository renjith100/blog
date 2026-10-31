import { addDays, getWeekStart, type Week } from "app/weekly/utils";
import Link from "next/link";
import { SourceIcon } from "./sources";

const MAX_ICONS = 3;
const WEEKS_PER_ROW = 5; // A month has four or five Mondays

/**
 * Returns the Mondays that fall in a month (YYYY-MM). A week belongs to the
 * month its Monday is in, so "Sep 28 – Oct 4" sits in the September row.
 */
function getMondays(month: string) {
	let monday = getWeekStart(`${month}-01`);
	if (monday.slice(0, 7) !== month) {
		monday = addDays(monday, 7);
	}

	const mondays: string[] = [];
	while (monday.slice(0, 7) === month) {
		mondays.push(monday);
		monday = addDays(monday, 7);
	}
	return mondays;
}

/**
 * Returns every month (YYYY-MM) from the first one to the last one, inclusive.
 */
function getMonths(first: string, last: string) {
	const months: string[] = [];
	let month = first;
	while (month <= last) {
		months.push(month);
		month = addDays(`${month}-28`, 7).slice(0, 7);
	}
	return months;
}

function formatMonth(month: string, withYear: boolean) {
	return new Date(`${month}-01T00:00:00Z`).toLocaleString("en-us", {
		timeZone: "UTC",
		month: "short",
		...(withYear ? { year: "numeric" } : {}),
	});
}

/**
 * Returns a week's distinct sources, most frequent first.
 */
function getSources(week: Week) {
	const counts = new Map<string, number>();
	for (const update of week.updates) {
		counts.set(update.source, (counts.get(update.source) ?? 0) + 1);
	}
	return Array.from(counts.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([source]) => source);
}

/**
 * Calendar of weeks, one row per month, from the first week with content to
 * the current month. Weeks with updates show their count and source icons.
 * Past weeks without updates are greyed out and future weeks are disabled;
 * the current week is always a link.
 *
 * @param weeks - Every week with content, from getWeeks()
 * @param current - Monday of the current week
 * @param selected - Monday of the week being shown
 */
export function WeekGrid({
	weeks,
	current,
	selected,
}: {
	weeks: Week[];
	current: string;
	selected: string;
}) {
	const byStart = new Map(weeks.map((week) => [week.start, week]));
	const first = weeks[0] && weeks[0].start < current ? weeks[0].start : current;
	const months = getMonths(first.slice(0, 7), current.slice(0, 7));

	return (
		<nav
			aria-label="Weeks"
			className="grid grid-cols-[2.5rem_repeat(5,minmax(0,1fr))] gap-1.5 sm:grid-cols-[3.5rem_repeat(5,minmax(0,1fr))] sm:gap-2"
		>
			{months.map((month, index) => {
				const mondays = getMondays(month);
				return (
					<div key={month} className="contents">
						<div className="self-center text-xs font-semibold uppercase tracking-wider text-sky-500">
							{formatMonth(month, index === 0 || month.endsWith("-01"))}
						</div>
						{mondays.map((start) => (
							<WeekCell
								key={start}
								start={start}
								week={byStart.get(start)}
								isCurrent={start === current}
								isSelected={start === selected}
								isFuture={start > current}
							/>
						))}
						{mondays.length < WEEKS_PER_ROW && <div aria-hidden />}
					</div>
				);
			})}
		</nav>
	);
}

function WeekCell({
	start,
	week,
	isCurrent,
	isSelected,
	isFuture,
}: {
	start: string;
	week?: Week;
	isCurrent: boolean;
	isSelected: boolean;
	isFuture: boolean;
}) {
	const count = week?.updates.length ?? 0;
	const sources = week ? getSources(week) : [];
	const label = `${Number(start.slice(8))}–${Number(addDays(start, 6).slice(8))}`;

	const content = (
		<>
			<div className="flex items-center gap-1 tabular-nums text-neutral-500 dark:text-neutral-400">
				{label}
				{isCurrent && (
					<span
						title="This week"
						className="h-1.5 w-1.5 rounded-full bg-sky-500"
					/>
				)}
			</div>
			{count > 0 && (
				<>
					<div className="mt-1 font-semibold">
						{count}
						<span className="hidden sm:inline">
							{count === 1 ? " update" : " updates"}
						</span>
					</div>
					<div className="mt-1 hidden items-center gap-1 sm:flex">
						{sources.slice(0, MAX_ICONS).map((source) => (
							<SourceIcon key={source} source={source} size={14} />
						))}
						{sources.length > MAX_ICONS && (
							<span className="text-xs text-neutral-500">
								+{sources.length - MAX_ICONS}
							</span>
						)}
					</div>
				</>
			)}
		</>
	);

	const base =
		"min-h-[3.5rem] rounded-md border p-1.5 text-xs sm:min-h-[4.75rem] sm:p-2 sm:text-sm";

	if (isFuture || (count === 0 && !isCurrent)) {
		return (
			<div
				aria-disabled
				className={`${base} border-neutral-200 text-neutral-400 dark:border-neutral-800 ${
					isFuture ? "opacity-40" : ""
				}`}
			>
				{content}
			</div>
		);
	}

	return (
		<Link
			href={`/weekly/${start}`}
			aria-current={isSelected ? "page" : undefined}
			className={`${base} bg-neutral-50 transition-colors hover:border-sky-500 dark:bg-neutral-900 ${
				isSelected
					? "border-sky-500 ring-1 ring-sky-500"
					: "border-neutral-200 dark:border-neutral-800"
			}`}
		>
			{content}
		</Link>
	);
}
