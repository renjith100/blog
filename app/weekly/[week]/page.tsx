import {
	formatWeekRange,
	getCurrentWeekStart,
	getWeeks,
} from "app/weekly/utils";
import { isWeekWithPage, TAGLINE, WeekView } from "app/weekly/week-view";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Rebuild hourly, so the grid's current week stays right
 */
export const revalidate = 3600;

/**
 * Pre-renders every week with updates, plus the current week.
 * Other weeks render on demand and 404 unless they have a page.
 */
export async function generateStaticParams() {
	const starts = new Set(getWeeks().map((week) => week.start));
	starts.add(getCurrentWeekStart());
	return Array.from(starts).map((week) => ({ week }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ week: string }>;
}): Promise<Metadata | undefined> {
	const { week } = await params;
	if (!isWeekWithPage(week)) {
		return;
	}

	return {
		title: `Week of ${formatWeekRange(week)} · Weekly`,
		description: TAGLINE,
	};
}

/**
 * /weekly/2026-10-26 shows the week starting that Monday
 */
export default async function Page({
	params,
}: {
	params: Promise<{ week: string }>;
}) {
	const { week } = await params;
	if (!isWeekWithPage(week)) {
		notFound();
	}

	return <WeekView start={week} />;
}
