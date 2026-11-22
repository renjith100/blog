"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Embeds a self-contained interactive HTML page from public/interactive/
 * in a blog post, e.g.
 * <Interactive src="/interactive/claude-expert-habits.html" title="Claude expert habits" />
 *
 * The page is served from this site, so the iframe is same-origin. That lets us:
 * - size the iframe to the page's full height (no inner scrollbar)
 * - pass the site's light/dark theme in as data-theme on the page's <html>
 * Only embed HTML written for this blog: same-origin pages run with the
 * same access as the blog's own code.
 */
export function Interactive({
	src,
	title,
	minHeight = 600,
}: {
	src: string;
	title: string;
	minHeight?: number;
}) {
	const ref = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(minHeight);
	const [loaded, setLoaded] = useState(false);
	const { resolvedTheme } = useTheme();

	const applyTheme = useCallback(() => {
		const root = ref.current?.contentDocument?.documentElement;
		if (root && resolvedTheme) root.dataset.theme = resolvedTheme;
	}, [resolvedTheme]);

	// The iframe can finish loading before React hydrates and attaches
	// handlers, so check for an already-loaded page as well as listening.
	useEffect(() => {
		const iframe = ref.current;
		if (!iframe) return;
		const onLoad = () => setLoaded(true);
		const doc = iframe.contentDocument;
		if (doc?.readyState === "complete" && doc.URL !== "about:blank") onLoad();
		iframe.addEventListener("load", onLoad);
		return () => iframe.removeEventListener("load", onLoad);
	}, []);

	// Follow the site's theme toggle
	useEffect(() => {
		if (loaded) applyTheme();
	}, [loaded, applyTheme]);

	// Keep the iframe as tall as its content as the reader opens lessons, the quiz, etc.
	useEffect(() => {
		const doc = ref.current?.contentDocument;
		if (!loaded || !doc?.body) return;
		// Measure the body, not documentElement.scrollHeight: the latter never
		// drops below the iframe's current height, so the iframe could only grow.
		const measure = () =>
			setHeight(Math.ceil(doc.body.getBoundingClientRect().height));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(doc.body);
		return () => observer.disconnect();
	}, [loaded]);

	return (
		<iframe
			ref={ref}
			src={src}
			title={title}
			loading="lazy"
			className="my-8 block w-full rounded-lg border border-neutral-200 dark:border-neutral-800"
			style={{ height }}
		/>
	);
}
