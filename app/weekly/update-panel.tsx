import { CustomMDX } from "app/components/mdx";
import { formatWeekRange, type WeeklyUpdate } from "app/weekly/utils";
import { SourceIcon } from "./sources";

/**
 * The inside of an update's popup: icon, title, source and week, then the
 * MDX body (summary, tweets and links) and the category.
 *
 * Rendered on the server, so tweets are fetched at build time; UpdateDialog
 * only decides which panel to show.
 *
 * @param update - The update to show
 */
export function UpdatePanel({ update }: { update: WeeklyUpdate }) {
	return (
		<>
			<div className="flex items-start gap-3 pr-8">
				<span className="mt-1.5">
					<SourceIcon source={update.source} size={24} />
				</span>
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						{update.title}
					</h2>
					<p className="mt-1 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
						{update.source} · Week of {formatWeekRange(update.week)}
					</p>
				</div>
			</div>
			<div className="prose mt-6 text-base">
				<CustomMDX source={update.content} />
			</div>
			<p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
				Filed under {update.category}
			</p>
		</>
	);
}
