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

// Reads `key: value` frontmatter the way the site does: CRLF or LF line
// endings, and surrounding quotes stripped from values.
const frontmatter = (raw, file) => {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) throw new Error(`${file}: no frontmatter`);
	const [, fm, body] = match;
	const meta = Object.fromEntries(
		fm
			.split(/\r?\n/)
			.filter((l) => l.includes(":"))
			.map((l) => {
				const i = l.indexOf(":");
				const value = l
					.slice(i + 1)
					.trim()
					.replace(/^(['"])(.*)\1$/, "$2");
				return [l.slice(0, i).trim(), value];
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
			? (frontmatter(fs.readFileSync(weekFile, "utf8"), weekFile).meta
					.summary ?? "")
			: "";
		const updates = fs
			.readdirSync(dir)
			.filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
			.map((f) => {
				const file = path.join(dir, f);
				const { meta } = frontmatter(fs.readFileSync(file, "utf8"), file);
				return {
					s: f.replace(/\.mdx$/, ""),
					t: meta.title,
					src: meta.source,
					d: meta.date,
				};
			})
			.sort((a, b) => b.d.localeCompare(a.d) || a.t.localeCompare(b.t)); // newest first, like the site
		return { start, summary, updates };
	})
	.filter((week) => week.updates.length > 0); // the site leaves out empty weeks too

const popupFile = path.join(content, POPUP_UPDATE);
const firstPara = frontmatter(fs.readFileSync(popupFile, "utf8"), popupFile)
	.body.trim()
	.split(/\r?\n\s*\r?\n/)[0];
// First two whole sentences. A sentence ends at . ! or ? followed by a space
// and a capital letter, so "U.S. and" or "e.g. a" don't end one.
const sentences = firstPara.split(/(?<=[.!?])\s+(?=[A-Z])/);
const popupSummary = sentences.slice(0, 2).join(" ");
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

fs.mkdirSync(path.join(here, "out"), { recursive: true });
const html = fs
	.readFileSync(path.join(here, "scene.template.html"), "utf8")
	.replace("__DATA__", () => JSON.stringify(weeks).replace(/<\//g, "<\\/"))
	.replaceAll("__FONTS__", `file://${path.join(repo, "public/fonts")}`)
	.replace("__SUMMARY__", () => escapeHtml(popupSummary));
fs.writeFileSync(path.join(here, "out/scene.html"), html);
console.log(`built out/scene.html with ${weeks.length} weeks`);
