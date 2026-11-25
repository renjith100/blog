/**
 * Embeds a YouTube video in a blog post by its id, e.g.
 * <YouTube id="oJvmnOCSzQY" title="A tour of AI This Week" />
 *
 * Uses youtube-nocookie.com, so YouTube sets no cookies until the reader
 * presses play. The player keeps a 16:9 shape at any width.
 * YouTube refuses to play embeds that send no referrer, so the referrer
 * policy is set explicitly in case a page tightens it.
 */
export function YouTube({ id, title }: { id: string; title: string }) {
	return (
		<div className="my-8 aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
			<iframe
				src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`}
				title={title}
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
				className="h-full w-full"
			/>
		</div>
	);
}
