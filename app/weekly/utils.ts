import fs from "node:fs";
import path from "node:path";
import { readFrontmatter } from "app/blog/utils";

/**
 * One update on the Weekly page. Each update is its own MDX file and opens
 * as one popup.
 *
 * Example file, app/weekly/content/2026-10-26/claude-haiku-5-5.mdx:
 * ---
 * title: Claude Haiku 5.5
 * source: Anthropic
 * date: 2026-10-28
 * category: Claude
 * ---
 * A short summary, then <Tweet id="..." /> embeds and links.
 */
export type WeeklyUpdate = {
	slug: string; // File name without .mdx, used in ?id=
	week: string; // Monday of the update's week (YYYY-MM-DD)
	title: string;
	source: string; // Company or project, e.g. Anthropic, OpenAI
	date: string; // Day it shipped (YYYY-MM-DD)
	category: string; // Shown as "Filed under"
	content: string; // MDX body
};

/**
 * One week on the Weekly page. Weeks run Monday to Sunday and live in a
 * folder named after their Monday. An optional _week.mdx holds the week's
 * one-line summary in its frontmatter.
 */
export type Week = {
	start: string; // Monday (YYYY-MM-DD)
	end: string; // Sunday (YYYY-MM-DD)
	summary: string;
	updates: WeeklyUpdate[]; // Newest first
};

const CONTENT_DIR = path.join(process.cwd(), "app", "weekly", "content");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = ["title", "source", "date", "category"] as const;

/**
 * Adds days to a YYYY-MM-DD date. Works in UTC so the result never shifts
 * with the server's timezone.
 */
export function addDays(date: string, days: number) {
	const d = new Date(`${date}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

/**
 * Returns the Monday of the week a date falls in.
 *
 * @param date - YYYY-MM-DD string, or a Date (read in UTC)
 *
 * Example:
 * getWeekStart("2026-10-31") => "2026-10-26"
 */
export function getWeekStart(date: string | Date) {
	const day = typeof date === "string" ? date : date.toISOString().slice(0, 10);
	const weekday = new Date(`${day}T00:00:00Z`).getUTCDay(); // 0 = Sunday
	return addDays(day, -((weekday + 6) % 7));
}

/**
 * Returns the Monday of the current week (UTC), which /weekly shows.
 */
export function getCurrentWeekStart() {
	return getWeekStart(new Date());
}

/**
 * Reads one update file and checks its frontmatter. Throws instead of
 * guessing, so a bad file fails the build rather than showing wrong data.
 */
function readUpdate(week: string, weekDir: string, file: string) {
	const filePath = path.join(weekDir, file);
	const { fields, content } = readFrontmatter(
		fs.readFileSync(filePath, "utf-8"),
	);

	const missing = REQUIRED_FIELDS.filter((key) => !fields?.[key]);
	if (!fields || missing.length > 0) {
		throw new Error(`${filePath}: missing ${missing.join(", ")}`);
	}
	if (!DATE_PATTERN.test(fields.date) || getWeekStart(fields.date) !== week) {
		throw new Error(
			`${filePath}: date ${fields.date} is not in the week of ${week}`,
		);
	}

	return {
		slug: path.basename(file, ".mdx"),
		week,
		title: fields.title,
		source: fields.source,
		date: fields.date,
		category: fields.category,
		content,
	};
}

/**
 * Reads one week folder: its updates, newest first, and its summary.
 */
function readWeek(contentDir: string, start: string): Week {
	const weekDir = path.join(contentDir, start);
	const files = fs.readdirSync(weekDir).filter((file) => file.endsWith(".mdx"));

	const updates = files
		.filter((file) => !file.startsWith("_"))
		.map((file) => readUpdate(start, weekDir, file))
		.sort(
			(a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
		);

	const summaryFile = path.join(weekDir, "_week.mdx");
	const summary = fs.existsSync(summaryFile)
		? readFrontmatter(fs.readFileSync(summaryFile, "utf-8")).fields?.summary
		: undefined;

	return { start, end: addDays(start, 6), summary: summary ?? "", updates };
}

/**
 * Retrieves every week that has a folder, oldest first.
 * This is the main export used by the Weekly pages.
 *
 * @param contentDir - Folder holding the week folders (defaults to
 * app/weekly/content)
 */
export function getWeeks(contentDir = CONTENT_DIR) {
	if (!fs.existsSync(contentDir)) {
		return [];
	}

	return fs
		.readdirSync(contentDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			if (
				!DATE_PATTERN.test(entry.name) ||
				getWeekStart(entry.name) !== entry.name
			) {
				throw new Error(
					`${path.join(contentDir, entry.name)}: week folders must be named after their Monday (YYYY-MM-DD)`,
				);
			}
			return readWeek(contentDir, entry.name);
		})
		.sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Retrieves one week by its Monday. A week with no folder yet comes back
 * empty, so the current week always has a page.
 */
export function getWeek(start: string, contentDir = CONTENT_DIR): Week {
	return (
		getWeeks(contentDir).find((week) => week.start === start) ?? {
			start,
			end: addDays(start, 6),
			summary: "",
			updates: [],
		}
	);
}

/**
 * Formats a week as a short range for headings.
 *
 * Examples:
 * formatWeekRange("2026-10-05") => "Oct 5 – 11"
 * formatWeekRange("2026-10-26") => "Oct 26 – Nov 1"
 */
export function formatWeekRange(start: string) {
	const format = (date: string, options: Intl.DateTimeFormatOptions) =>
		new Date(`${date}T00:00:00Z`).toLocaleString("en-us", {
			timeZone: "UTC",
			...options,
		});
	const end = addDays(start, 6);
	const sameMonth = start.slice(0, 7) === end.slice(0, 7);

	return `${format(start, { month: "short", day: "numeric" })} – ${format(
		end,
		sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
	)}`;
}
