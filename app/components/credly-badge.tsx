"use client";

import { useEffect } from "react";

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
	useEffect(() => {
		const SCRIPT_ID = "credly-embed-js";
		const existing = document.getElementById(SCRIPT_ID);
		if (existing) {
			existing.remove();
		}
		const script = document.createElement("script");
		script.id = SCRIPT_ID;
		script.src = "https://cdn.credly.com/assets/utilities/embed.js";
		script.async = true;
		document.head.appendChild(script);
	}, []);

	return (
		<div className="credly-badge-container inline-block rounded-lg bg-white p-4 dark:bg-neutral-900">
			<div
				data-iframe-width={width}
				data-iframe-height={height}
				data-share-badge-id={badgeId}
				data-share-badge-host="https://www.credly.com"
			/>
		</div>
	);
}
