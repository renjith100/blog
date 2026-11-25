import type { Metadata } from "next";
import { getDefaultWeekStart } from "./utils";
import { TAGLINE, WeekView } from "./week-view";

/**
 * Rebuild hourly, so the current week moves on each Monday even when
 * nothing new is deployed
 */
export const revalidate = 3600;

export const metadata: Metadata = {
	title: "AI This Week",
	description: TAGLINE,
};

/**
 * /weekly shows the current week, or the latest week with updates while
 * the current week is still empty
 */
export default function Page() {
	return <WeekView start={getDefaultWeekStart()} />;
}
