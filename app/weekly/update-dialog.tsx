"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import type { UpdatePanel } from "./update-panel";

/** Length of the weekly-popup-out animation in global.css, in ms */
const CLOSE_MS = 160;
/** Longest wait for images before the popup shows anyway, in ms */
const MAX_WAIT_MS = 2500;

/**
 * Resolves on the next frame where `isDone()` is true, and stops checking
 * after MAX_WAIT_MS so a tweet that never loads can't keep it running
 */
function waitUntil(isDone: () => boolean) {
	const deadline = performance.now() + MAX_WAIT_MS;
	return new Promise<void>((resolve) => {
		const check = () => {
			if (isDone() || performance.now() > deadline) {
				resolve();
			} else {
				requestAnimationFrame(check);
			}
		};
		check();
	});
}

/**
 * Resolves once the popup's content has its final size, or after
 * MAX_WAIT_MS: first every tweet has replaced its loading skeleton
 * (react-tweet streams them in, which changes their height), then every
 * image has loaded or failed. Lazy images are switched to eager: inside the
 * hidden, scrolling popup they would otherwise never start loading.
 */
function waitForContent(root: HTMLElement) {
	const ready = (async () => {
		// Every react-tweet box has .react-tweet-theme. A loaded tweet has
		// links (author, Follow) and a failed one an <h3> ("Tweet not found");
		// the loading skeleton has neither
		await waitUntil(() =>
			Array.from(root.querySelectorAll(".react-tweet-theme")).every((tweet) =>
				tweet.querySelector("a, h3"),
			),
		);
		const pending = Array.from(root.querySelectorAll("img")).filter((img) => {
			img.loading = "eager";
			return !img.complete;
		});
		await Promise.all(
			pending.map(
				(img) =>
					new Promise<void>((resolve) => {
						img.addEventListener("load", () => resolve(), { once: true });
						img.addEventListener("error", () => resolve(), { once: true });
					}),
			),
		);
	})();
	const timeout = new Promise<void>((resolve) =>
		window.setTimeout(resolve, MAX_WAIT_MS),
	);
	return Promise.race([ready, timeout]);
}

/**
 * Popup for the update named in ?id=. Uses a native <dialog>, which gives
 * Esc to close, focus trapping and a backdrop. Closing removes ?id= from the
 * URL, and an unknown id simply shows nothing.
 *
 * While the update's tweets and images load, only the
 * backdrop and a spinner show; the card is laid out but invisible. Once
 * they're in, the card springs in at its final size, so nothing grows or
 * jumps after it appears (the weekly-popup styles in global.css). To let
 * the fade-out play, close() first sets data-closing and only changes the
 * URL once it has finished. Until it's ready the card is inert, so focus
 * and screen readers can't reach it; then focus moves to its close button.
 *
 * Must be inside a <Suspense> boundary, because it reads the search params
 * on a statically built page.
 *
 * @param panels - Each update's header and body, keyed by slug
 */
export function UpdateDialog({
	panels,
}: {
	panels: Record<string, UpdatePanel>;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const id = useSearchParams().get("id");
	// Own properties only, so ?id=__proto__ or ?id=toString shows nothing
	const panel = id && Object.hasOwn(panels, id) ? panels[id] : undefined;
	const dialogRef = useRef<HTMLDialogElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const closeTimerRef = useRef<number | undefined>(undefined);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;
		const card = cardRef.current;
		if (!dialog || !card || !panel) {
			return;
		}

		let cancelled = false;
		setReady(false);
		dialog.showModal();
		document.body.style.overflow = "hidden";
		waitForContent(card).then(() => {
			if (!cancelled) {
				setReady(true);
				// The card was inert while loading, so showModal() couldn't focus
				// it; give focus to its first control now, as it would have
				requestAnimationFrame(() =>
					closeButtonRef.current?.focus({ preventScroll: true }),
				);
			}
		});
		return () => {
			cancelled = true;
			// A close still fading out mustn't change the URL after the update
			// or page has changed
			window.clearTimeout(closeTimerRef.current);
			dialog.close();
			document.body.style.overflow = "";
		};
	}, [panel]);

	if (!panel) {
		return null;
	}

	const close = () => {
		const dialog = dialogRef.current;
		if (dialog?.hasAttribute("data-closing")) {
			return;
		}
		const finish = () => router.replace(pathname, { scroll: false });
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (!dialog || reduced) {
			finish();
			return;
		}
		dialog.setAttribute("data-closing", "");
		closeTimerRef.current = window.setTimeout(finish, CLOSE_MS);
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: The click only catches the backdrop; keyboard users close with Esc via onCancel
		<dialog
			ref={dialogRef}
			aria-label="Update"
			onCancel={(event) => {
				// Esc: let the URL change close it, so history stays in sync
				event.preventDefault();
				close();
			}}
			onClick={(event) => {
				// A click on the dialog itself, not its content, is the backdrop
				if (event.target === event.currentTarget) {
					close();
				}
			}}
			className="weekly-dialog m-auto w-[calc(100%-2rem)] max-w-2xl overflow-visible border-0 bg-transparent p-0 text-[var(--foreground)] backdrop:bg-black/60"
		>
			{!ready && (
				<div
					role="status"
					aria-label="Loading"
					className="pointer-events-none fixed inset-0 grid place-items-center"
				>
					<span className="h-8 w-8 animate-spin rounded-full motion-reduce:animate-none border-[3px] border-white/30 border-t-white" />
				</div>
			)}
			{/* The card, not the dialog, animates. Its inner div scrolls, so the
			    animation scales a plain box instead of a scroll area. Until it's
			    ready the card is invisible but laid out, so its images load. */}
			<div
				ref={cardRef}
				inert={!ready}
				className={`relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-[var(--background)] shadow-2xl dark:border-neutral-800 ${ready ? "weekly-popup" : "opacity-0"}`}
			>
				{/* Outside both parts, so it stays in the corner */}
				<button
					ref={closeButtonRef}
					type="button"
					onClick={close}
					aria-label="Close"
					className="absolute right-4 top-4 z-20 rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
				>
					<FiX size={20} />
				</button>
				{/* The title bar stays put and only the body scrolls, so the
				    scrollbar starts below the title */}
				<div className="shrink-0 border-b border-neutral-200 px-5 pb-4 pr-12 pt-5 sm:px-6 sm:pr-14 sm:pt-6 dark:border-neutral-800">
					{panel.header}
				</div>
				<div className="weekly-popup-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
					{panel.body}
				</div>
			</div>
		</dialog>
	);
}
