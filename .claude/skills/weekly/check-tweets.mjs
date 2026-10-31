// Checks that every <Tweet id="..." /> in a Weekly week folder loads.
//
// Usage, from the repo root:
//   node .claude/skills/weekly/check-tweets.mjs 2026-10-26
//
// Prints one line per tweet and exits with 1 if any tweet is missing.
// A tweet posted outside the week is only a warning: announcements are
// sometimes picked up a day or two late.

import fs from "node:fs";
import path from "node:path";
import { getTweet } from "react-tweet/api";

const week = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(week ?? "")) {
	console.error(
		"Usage: node .claude/skills/weekly/check-tweets.mjs YYYY-MM-DD",
	);
	process.exit(2);
}

const dir = path.join("app", "weekly", "content", week);
if (!fs.existsSync(dir)) {
	console.error(`No folder ${dir}`);
	process.exit(2);
}

const weekEnd = new Date(`${week}T00:00:00Z`);
weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

let missing = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
	const text = fs.readFileSync(path.join(dir, file), "utf-8");
	for (const [, id] of text.matchAll(/<Tweet\s+id="(\d+)"/g)) {
		const tweet = await getTweet(id).catch(() => undefined);
		if (!tweet) {
			missing++;
			console.log(`MISSING  ${file}  ${id}`);
			continue;
		}

		const posted = new Date(tweet.created_at);
		const inWeek = posted >= new Date(`${week}T00:00:00Z`) && posted < weekEnd;
		console.log(
			`${inWeek ? "ok      " : "WARN    "}  ${file}  ${id}  @${tweet.user.screen_name}  ${posted.toISOString().slice(0, 10)}${inWeek ? "" : " (outside the week)"}  ${tweet.text.slice(0, 60).replace(/\s+/g, " ")}`,
		);
	}
}

process.exit(missing > 0 ? 1 : 0);
