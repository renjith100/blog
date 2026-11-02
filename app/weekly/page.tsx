import type { Metadata } from "next";
import { getCurrentWeekStart, getWeek, getWeeks } from "./utils";
import { TAGLINE, WeekView } from "./week-view";

/**
 * Rebuild hourly, so the current week moves on each Monday even when
 * nothing new is deployed
 */
export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Weekly",
	description: TAGLINE,
};

/**
 * Returns the week /weekly opens on: the current week once it has an
 * update, otherwise the latest week that has some, so the page never
 * opens on an empty list early in the week.
 */
function getDefaultWeekStart() {
	const current = getCurrentWeekStart();
	if (getWeek(current).updates.length > 0) {
		return current;
	}
	return getWeeks().at(-1)?.start ?? current;
}

/**
 * /weekly shows the current week, or the latest week with updates while
 * the current week is still empty
 */
export default function Page() {
	return <WeekView start={getDefaultWeekStart()} />;
}
