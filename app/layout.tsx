import "./global.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientTopScrollProgressBar from "./components/ClientTopScrollProgressBar";
import Footer from "./components/footer";
import { Navbar } from "./components/nav";
import { CSPostHogProvider } from "./providers/posthog-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { baseUrl } from "./sitemap";

// Load Atkinson Hyperlegible font
const atkinsonHyperlegible = localFont({
	src: [
		{
			path: "../public/fonts/atkinson-hyperlegible/Atkinson-Hyperlegible-Regular-102a.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/atkinson-hyperlegible/Atkinson-Hyperlegible-Italic-102a.woff2",
			weight: "400",
			style: "italic",
		},
		{
			path: "../public/fonts/atkinson-hyperlegible/Atkinson-Hyperlegible-Bold-102a.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../public/fonts/atkinson-hyperlegible/Atkinson-Hyperlegible-BoldItalic-102a.woff2",
			weight: "700",
			style: "italic",
		},
	],
	variable: "--font-base",
});

// Load Outfit font
const outfit = localFont({
	src: [
		{
			path: "../public/fonts/outfit/Outfit-Medium.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/outfit/Outfit-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-display",
});

// Load Fira Code font
const firaCode = localFont({
	src: [
		{
			path: "../public/fonts/fira-code/FiraCode-Medium.woff2",
			weight: "500",
			style: "normal",
		},
	],
	variable: "--font-mono",
});

/**
 * Default metadata configuration for the entire application
 * Provides SEO and OpenGraph settings used across all pages
 *
 * Includes:
 * - Base title and title template
 * - Site description
 * - OpenGraph metadata
 * - Robot crawling instructions
 */
export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Renjith Abraham",
		template: "%s | Renjith Abraham",
	},
	description: "Renjith Abraham's Portfolio.",
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: {
		title: "Renjith Abraham",
		description: "Renjith Abraham's Portfolio.",
		url: baseUrl,
		siteName: "Renjith Abraham",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/images/og-r.png",
				width: 400,
				height: 400,
				alt: "Renjith Abraham's Portfolio",
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

/**
 * Utility function to conditionally join CSS classes
 * Filters out falsy values and joins with spaces
 *
 * @param classes - Array of class names or falsy values
 * @returns String of joined class names
 */
const cx = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Root Layout Component
 * Provides the base structure for all pages
 *
 * Features:
 * - Custom fonts (Geist Sans and Mono)
 * - Dark mode support
 * - Analytics integration
 * - Speed insights
 * - Responsive navigation
 * - Consistent footer
 *
 * @param children - Page content to be rendered
 * @returns Root layout structure
 */
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cx(
				atkinsonHyperlegible.variable,
				outfit.variable,
				firaCode.variable,
			)}
		>
			<body className="antialiased">
				<CSPostHogProvider>
					<ClientTopScrollProgressBar />
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<div className="max-w-6xl mx-4 mt-8 lg:mx-auto">
							<main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
								<Navbar />
								{children}
								<Footer />
								<Analytics />
								<SpeedInsights />
							</main>
						</div>
					</ThemeProvider>
				</CSPostHogProvider>
			</body>
		</html>
	);
}
