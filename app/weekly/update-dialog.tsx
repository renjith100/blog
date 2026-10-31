"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

/**
 * Popup for the update named in ?id=. Uses a native <dialog>, which gives
 * Esc to close, focus trapping and a backdrop. Closing removes ?id= from the
 * URL, and an unknown id simply shows nothing.
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
	const panel = id ? panels[id] : undefined;
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog || !panel) {
			return;
		}

		dialog.showModal();
		document.body.style.overflow = "hidden";
		return () => {
			dialog.close();
			document.body.style.overflow = "";
		};
	}, [panel]);

	if (!panel) {
		return null;
	}

	const close = () => router.replace(pathname, { scroll: false });

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
			className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg border border-neutral-200 bg-[var(--background)] p-0 text-[var(--foreground)] shadow-xl backdrop:bg-black/60 dark:border-neutral-800"
		>
			<div className="relative p-5 sm:p-6">
				<button
					type="button"
					onClick={close}
					aria-label="Close"
					className="absolute right-4 top-4 rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
				>
					<FiX size={20} />
				</button>
				{panel}
			</div>
		</dialog>
	);
}
