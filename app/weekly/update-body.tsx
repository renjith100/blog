import { CustomMDX } from "app/components/mdx";
import type { WeeklyUpdate } from "app/weekly/utils";

/**
 * The inside of an open update row: the MDX body (summary, tweets and
 * links), then the category. The row's title bar already shows the icon,
 * source, title and weekday, so they aren't repeated here.
 *
 * Rendered on the server, so tweets are fetched at build time.
 *
 * @param update - The update to show
 */
export function UpdateBody({ update }: { update: WeeklyUpdate }) {
	return (
		// The outer div is what UpdateAccordion animates, so it has no padding
		<div data-update-body>
			<div className="px-3 pb-5 pt-2 sm:pl-[10.25rem]">
				{/* Smaller than a blog post's 24px paragraphs, so the row's title
				    reads as the title and an update fits a phone screen better */}
				<div className="prose text-base [&_p]:!my-3 [&_p]:!text-lg">
					<CustomMDX source={update.content} />
				</div>
				<p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
					Filed under {update.category}
				</p>
			</div>
		</div>
	);
}
