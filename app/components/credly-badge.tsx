"use client";

import Script from "next/script";

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
	return (
		<>
			<div
				data-iframe-width={width}
				data-iframe-height={height}
				data-share-badge-id={badgeId}
				data-share-badge-host="https://www.credly.com"
			/>
			<Script
				src="https://cdn.credly.com/assets/utilities/embed.js"
				strategy="lazyOnload"
			/>
		</>
	);
}
