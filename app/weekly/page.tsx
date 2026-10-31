import type { Metadata } from "next";
import { getCurrentWeekStart } from "./utils";
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
 * /weekly shows the current week
 */
export default function Page() {
	return <WeekView start={getCurrentWeekStart()} />;
}
