"use client";

import { TopScrollProgressBar } from "nextjs-top-scroll-progress-bar";

interface TopScrollProgressBarProps {
	height?: number;
	color?: string;
}

export default function ClientTopScrollProgressBar({
	height,
	color,
}: TopScrollProgressBarProps) {
	return <TopScrollProgressBar height={height} color={color} />;
}
