import { CustomMDX } from "app/components/mdx";
import { formatWeekRange, type WeeklyUpdate } from "app/weekly/utils";
import { SourceIcon } from "./sources";

/**
 * An update's popup content in two parts, so UpdateDialog can keep the
 * title bar fixed above the scrolling body (and its scrollbar):
 * - header: icon, title, source and week
 * - body: the MDX (summary, tweets and links) and the category
 *
 * Rendered on the server, so tweets are fetched at build time; UpdateDialog
 * only decides which update to show.
 */
export type UpdatePanel = { header: React.ReactNode; body: React.ReactNode };

/**
 * Builds an update's popup content.
 *
 * @param update - The update to show
 */
export function renderUpdatePanel(update: WeeklyUpdate): UpdatePanel {
	return {
		header: (
			<div className="flex items-start gap-3">
				<span className="mt-1.5">
					<SourceIcon source={update.source} size={24} />
				</span>
				<div>
					<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
						{update.title}
					</h2>
					<p className="mt-1 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
						{update.source} · Week of {formatWeekRange(update.week)}
					</p>
				</div>
			</div>
		),
		body: (
			<>
				<div className="prose text-base">
					<CustomMDX source={update.content} />
				</div>
				<p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
					Filed under {update.category}
				</p>
			</>
		),
	};
}
