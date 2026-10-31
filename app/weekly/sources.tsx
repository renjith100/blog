import type { IconType } from "react-icons";
import { FiZap } from "react-icons/fi";
import {
	SiAnthropic,
	SiGithubcopilot,
	SiGoogle,
	SiGooglegemini,
	SiHuggingface,
	SiMeta,
	SiOpenai,
	SiPerplexity,
	SiX,
} from "react-icons/si";

/**
 * Icons for the `source` field of Weekly updates, keyed by lowercase name.
 * A color is the brand color; without one the icon uses the text color, so
 * black-and-white logos work in both themes.
 *
 * Sources missing here (e.g. Cursor, which has no react-icons logo) fall back
 * to a letter badge, so a new source never breaks the page.
 */
const SOURCES: Record<string, { icon: IconType; color?: string }> = {
	anthropic: { icon: SiAnthropic, color: "#D97757" },
	openai: { icon: SiOpenai },
	google: { icon: SiGoogle, color: "#4285F4" },
	gemini: { icon: SiGooglegemini, color: "#8E75B2" },
	xai: { icon: SiX }, // react-icons has no xAI logo
	meta: { icon: SiMeta, color: "#0467DF" },
	perplexity: { icon: SiPerplexity, color: "#1FB8CD" },
	"github copilot": { icon: SiGithubcopilot },
	"hugging face": { icon: SiHuggingface }, // Brand yellow is faint on white
	other: { icon: FiZap },
};

/**
 * Renders the icon for an update's source.
 *
 * @param source - The update's `source`, e.g. "Anthropic" (any case)
 * @param size - Icon size in pixels
 */
export function SourceIcon({
	source,
	size = 16,
}: {
	source: string;
	size?: number;
}) {
	const match = SOURCES[source.trim().toLowerCase()];

	if (!match) {
		return (
			<span
				aria-hidden
				className="inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
				style={{ width: size, height: size, fontSize: size * 0.6 }}
			>
				{source.trim().charAt(0).toUpperCase()}
			</span>
		);
	}

	const Icon = match.icon;
	return (
		<Icon
			aria-hidden
			className="shrink-0"
			size={size}
			style={match.color ? { color: match.color } : undefined}
		/>
	);
}
