"use client";

import { useEffect, useRef } from "react";

interface CredlyBadgeProps {
	badgeId: string;
	width?: number;
	height?: number;
}

export function CredlyBadge({
	badgeId,
	width = 150,
	height = 270,
}: CredlyBadgeProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://cdn.credly.com/assets/utilities/embed.js";
		script.async = true;
		containerRef.current?.appendChild(script);

		return () => {
			script.remove();
		};
	}, []);

	return (
		<div ref={containerRef}>
			<div
				data-iframe-width={width}
				data-iframe-height={height}
				data-share-badge-id={badgeId}
				data-share-badge-host="https://www.credly.com"
			/>
		</div>
	);
}
