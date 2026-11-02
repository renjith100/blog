"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

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
		// Every react-tweet box has .react-tweet-theme; the loading skeleton
		// is the only one without links (author, Follow)
		await waitUntil(() =>
			Array.from(root.querySelectorAll(".react-tweet-theme")).every((tweet) =>
				tweet.querySelector("a"),
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
 * URL once it has finished.
 *
 * Must be inside a <Suspense> boundary, because it reads the search params
 * on a statically built page.
 *
 * @param panels - Each update's rendered UpdatePanel, keyed by slug
 */
export function UpdateDialog({
	panels,
}: {
	panels: Record<string, ReactNode>;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const id = useSearchParams().get("id");
	// Own properties only, so ?id=__proto__ or ?id=toString shows nothing
	const panel = id && Object.hasOwn(panels, id) ? panels[id] : undefined;
	const dialogRef = useRef<HTMLDialogElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
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
			}
		});
		return () => {
			cancelled = true;
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
		window.setTimeout(finish, CLOSE_MS);
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
					<span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
				</div>
			)}
			{/* The card, not the dialog, animates. Its inner div scrolls, so the
			    animation scales a plain box instead of a scroll area. Until it's
			    ready the card is invisible but laid out, so its images load. */}
			<div
				ref={cardRef}
				className={`overflow-hidden rounded-2xl border border-neutral-200 bg-[var(--background)] shadow-2xl dark:border-neutral-800 ${ready ? "weekly-popup" : "opacity-0"}`}
			>
				<div className="relative max-h-[85vh] overflow-y-auto p-5 sm:p-6">
					<button
						type="button"
						onClick={close}
						aria-label="Close"
						className="absolute right-4 top-4 rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
					>
						<FiX size={20} />
					</button>
					{panel}
				</div>
			</div>
		</dialog>
	);
}
