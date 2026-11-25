// Builds out/scene.html from scene.template.html, filling in:
// - __DATA__: every AI This Week week (summary + updates), read from app/weekly/content
// - __FONTS__: the site's fonts in public/fonts
// - __SUMMARY__: the first two sentences of the update the popup shows
// Usage: node build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const content = path.join(repo, "app/weekly/content");
const POPUP_UPDATE = "2026-11-09/claude-meetings.mdx";

const frontmatter = (raw) => {
	const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	const meta = Object.fromEntries(
		fm.split("\n").map((l) => {
			const i = l.indexOf(":");
			return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
		}),
	);
	return { meta, body };
};

const weeks = fs
	.readdirSync(content)
	.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
	.sort()
	.map((start) => {
		const dir = path.join(content, start);
		const weekFile = path.join(dir, "_week.mdx");
		const summary = fs.existsSync(weekFile)
			? (frontmatter(fs.readFileSync(weekFile, "utf8")).meta.summary ?? "")
			: "";
		const updates = fs
			.readdirSync(dir)
			.filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
			.map((f) => {
				const { meta } = frontmatter(
					fs.readFileSync(path.join(dir, f), "utf8"),
				);
				return {
					s: f.replace(/\.mdx$/, ""),
					t: meta.title,
					src: meta.source,
					d: meta.date,
				};
			})
			.sort((a, b) => b.d.localeCompare(a.d) || a.t.localeCompare(b.t)); // newest first, like the site
		return { start, summary, updates };
	});

const firstPara = frontmatter(
	fs.readFileSync(path.join(content, POPUP_UPDATE), "utf8"),
)
	.body.trim()
	.split(/\n\s*\n/)[0];
const popupSummary = `${firstPara.split(". ").slice(0, 2).join(". ")}.`;
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

fs.mkdirSync(path.join(here, "out"), { recursive: true });
const html = fs
	.readFileSync(path.join(here, "scene.template.html"), "utf8")
	.replace("__DATA__", () => JSON.stringify(weeks).replace(/<\//g, "<\\/"))
	.replaceAll("__FONTS__", `file://${path.join(repo, "public/fonts")}`)
	.replace("__SUMMARY__", () => escapeHtml(popupSummary));
fs.writeFileSync(path.join(here, "out/scene.html"), html);
console.log(`built out/scene.html with ${weeks.length} weeks`);
