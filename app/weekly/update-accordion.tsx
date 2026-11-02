"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";

/** How long opening and closing take, in ms */
const DURATION = 320;
/** Gap between the top of the screen and an opened row's title, in px */
const TOP_GAP = 12;

/**
 * Returns the update a link points to: #<slug>, or the older ?id=<slug>
 * that links shared before the accordion use.
 */
function getLinkedSlug() {
	const hash = decodeURIComponent(window.location.hash.slice(1));
	return hash || new URLSearchParams(window.location.search).get("id");
}

function easeInOutCubic(t: number) {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** The body of a row: the part that opens and closes */
function getBody(row: HTMLDetailsElement) {
	return row.querySelector<HTMLElement>(":scope > [data-update-body]");
}

/** The update rows inside the accordion */
function getRowsIn(root: HTMLElement | null) {
	return Array.from(root?.querySelectorAll("details") ?? []);
}

/** A row's top, measured from the top of the page */
function pageTop(row: HTMLDetailsElement) {
	return row.getBoundingClientRect().top + window.scrollY;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Cuts a body down to the part that's on screen: the part below the screen
 * is dropped, and the part above it is hidden by pulling the content up.
 * Only what can be seen is then animated. On a phone an update is two to
 * four screens tall, and collapsing all of it in one animation makes the
 * page fly past and costs a re-layout of every tweet on every frame.
 * The caller scrolls to make up for the part removed above (keepInPlace).
 *
 * @returns The height left, which is what gets animated
 */
function clipToScreen(body: HTMLElement) {
	const rect = body.getBoundingClientRect();
	const above = clamp(-rect.top, 0, rect.height);
	const below = clamp(rect.bottom - window.innerHeight, 0, rect.height - above);
	const visible = rect.height - above - below;

	body.style.overflow = "hidden";
	body.style.height = `${visible}px`;
	const content = body.firstElementChild as HTMLElement | null;
	content?.style.setProperty("margin-top", `${-above}px`);
	return visible;
}

/**
 * Scrolls so `element` is back at the screen position `before`. Measured,
 * not worked out, so it's right whether or not the browser's own scroll
 * anchoring already moved the page.
 */
function keepInPlace(element: Element, before: number) {
	const drift = element.getBoundingClientRect().top - before;
	if (drift !== 0) {
		window.scrollBy({ top: drift, behavior: "instant" });
	}
}

/** Undoes clipToScreen() and any animated height */
function resetBody(body: HTMLElement) {
	body.style.removeProperty("height");
	body.style.removeProperty("overflow");
	const content = body.firstElementChild as HTMLElement | null;
	content?.style.removeProperty("margin-top");
}

/**
 * Runs `step` once per frame with eased progress from 0 to 1, then `done`.
 * With reduced motion it jumps straight to the end.
 */
function animate(step: (progress: number) => void, done: () => void) {
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (reduced) {
		step(1);
		done();
		return;
	}

	const start = performance.now();
	const frame = (now: number) => {
		const t = Math.min((now - start) / DURATION, 1);
		step(easeInOutCubic(t));
		if (t < 1) {
			requestAnimationFrame(frame);
		} else {
			done();
		}
	};
	requestAnimationFrame(frame);
}

/**
 * Makes the update rows (<details> elements from UpdateList) work as an
 * animated accordion:
 *
 * - Opening a row expands it, collapses the open row and scrolls the new
 *   row's title to the top of the screen, all in one animation, so most of
 *   its content is in view. Only the on-screen parts animate, so a phone,
 *   where updates are several screens tall, moves as calmly as a desktop.
 * - Closing a row collapses it. If its top had scrolled off the screen,
 *   the page scrolls back so the closed row is at the top.
 * - #<slug> and the older ?id=<slug> links open their row at the top of the
 *   screen. The URL shows #<slug> while a row is open.
 *
 * The rows share a `name` so that, without JavaScript, the browser still
 * keeps one open. This component removes it, because the browser would
 * close the old row instantly instead of letting it animate.
 *
 * @param children - The update rows, from UpdateList
 */
export function UpdateAccordion({ children }: { children: ReactNode }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const busyRef = useRef(false);

	const getRows = () => getRowsIn(rootRef.current);

	useEffect(() => {
		const root = rootRef.current;
		for (const row of getRowsIn(root)) {
			row.removeAttribute("name");
		}

		const openLinked = () => {
			const slug = getLinkedSlug();
			const rows = getRowsIn(root);
			const row = rows.find((details) => details.id === slug);
			if (!row) {
				return;
			}
			for (const other of rows) {
				other.open = other === row;
			}
			window.scrollTo({ top: pageTop(row) - TOP_GAP, behavior: "instant" });
			// Swap an old ?id= link for the #slug form
			window.history.replaceState(
				null,
				"",
				`${window.location.pathname}#${row.id}`,
			);
		};

		openLinked();
		window.addEventListener("hashchange", openLinked);
		return () => window.removeEventListener("hashchange", openLinked);
	}, []);

	/**
	 * While rows animate: turns off the browser's scroll anchoring, so only
	 * this code moves the page, and adds room below the list, so the page is
	 * never too short for the scroll position mid-animation. The room goes at
	 * the end, when the target scroll already fits the finished page.
	 */
	const setAnimating = (on: boolean) => {
		document.documentElement.style.overflowAnchor = on ? "none" : "";
		rootRef.current?.style.setProperty(
			"padding-bottom",
			on ? `${window.innerHeight}px` : "",
		);
	};

	/**
	 * The lowest scroll position once `shrinkBy` px are gone from the page
	 * and the room setAnimating() adds is gone again
	 */
	const maxScrollAfter = (shrinkBy: number) => {
		const room =
			Number.parseFloat(rootRef.current?.style.paddingBottom ?? "") || 0;
		return (
			document.documentElement.scrollHeight -
			room -
			shrinkBy -
			window.innerHeight
		);
	};

	const open = (row: HTMLDetailsElement) => {
		const previous = getRows().find((other) => other.open && other !== row);
		const previousBody = previous ? getBody(previous) : null;

		setAnimating(true);
		// The old row drops its open title style and only collapses its
		// on-screen part (see clipToScreen); the tapped row stays put
		const before = row.getBoundingClientRect().top;
		let previousHeight = 0;
		if (previous && previousBody) {
			previous.dataset.closing = "";
			previousHeight = clipToScreen(previousBody);
		}
		keepInPlace(row, before);

		row.open = true;
		const body = getBody(row);
		if (!body) {
			setAnimating(false);
			busyRef.current = false;
			return;
		}
		const fullHeight = body.offsetHeight;
		// Grow only as far as the screen shows; the rest is below the screen
		// and is added at the end, where it can't be seen
		const height = Math.min(fullHeight, window.innerHeight);

		// Where the new row's title ends up once the old row has closed
		const previousIsAbove =
			previous !== undefined &&
			(previous.compareDocumentPosition(row) &
				Node.DOCUMENT_POSITION_FOLLOWING) !==
				0;
		const finalTop = pageTop(row) - (previousIsAbove ? previousHeight : 0);
		const targetY = clamp(
			finalTop - TOP_GAP,
			0,
			Math.max(0, maxScrollAfter(previousHeight)),
		);
		const startY = window.scrollY;

		body.style.overflow = "hidden";
		body.style.height = "0px";

		animate(
			(progress) => {
				body.style.height = `${height * progress}px`;
				if (previousBody) {
					previousBody.style.height = `${previousHeight * (1 - progress)}px`;
				}
				window.scrollTo({
					top: startY + (targetY - startY) * progress,
					behavior: "instant",
				});
			},
			() => {
				resetBody(body);
				if (previous && previousBody) {
					previous.open = false;
					delete previous.dataset.closing;
					resetBody(previousBody);
				}
				setAnimating(false);
				busyRef.current = false;
			},
		);
	};

	const close = (row: HTMLDetailsElement) => {
		const body = getBody(row);
		if (!body) {
			row.open = false;
			busyRef.current = false;
			return;
		}
		setAnimating(true);
		// Drop the open title style and keep only the on-screen part, with
		// the visible text staying where it is
		const content = body.firstElementChild ?? body;
		const before = content.getBoundingClientRect().top;
		row.dataset.closing = "";
		const height = clipToScreen(body);
		keepInPlace(content, before);
		const startY = window.scrollY;
		const top = row.getBoundingClientRect().top;
		// Scroll back only if the row's title is off the screen, but never
		// past what the shorter page allows (closing the last row at the
		// bottom), or the browser would snap the page up at the end
		const targetY = clamp(
			top < 0 ? startY + top - TOP_GAP : startY,
			0,
			Math.max(0, maxScrollAfter(height)),
		);

		animate(
			(progress) => {
				body.style.height = `${height * (1 - progress)}px`;
				window.scrollTo({
					top: startY + (targetY - startY) * progress,
					behavior: "instant",
				});
			},
			() => {
				row.open = false;
				delete row.dataset.closing;
				resetBody(body);
				setAnimating(false);
				busyRef.current = false;
			},
		);
	};

	const onClick = (event: MouseEvent<HTMLDivElement>) => {
		const summary = (event.target as Element).closest("summary");
		const row = summary?.parentElement;
		if (!summary || !(row instanceof HTMLDetailsElement)) {
			return;
		}

		event.preventDefault();
		if (busyRef.current) {
			return;
		}
		busyRef.current = true;

		const { pathname } = window.location;
		if (row.open) {
			close(row);
			window.history.replaceState(null, "", pathname);
		} else {
			open(row);
			window.history.replaceState(null, "", `${pathname}#${row.id}`);
		}
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: Only catches clicks on the <summary> rows, which are keyboard accessible themselves (Enter and Space fire this click)
		<div ref={rootRef} onClick={onClick}>
			{children}
		</div>
	);
}
