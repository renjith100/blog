---
name: weekly
description: Add this week's agent news to the Weekly page (/weekly) on Renjith's blog. Use when he says "update weekly", "do this week's updates", "add to weekly", "weekly updates", or pastes an announcement or X link to add. Works any day of the week, not only Sundays.
---

# Weekly: add this week's agent updates

The Weekly page (`/weekly`) lists what shipped in AI agents, one week at a
time. Each update is its own MDX file and opens as a popup with a short
summary, embedded X posts and links. The code lives in `app/weekly/`.

## 1. Find the week

Weeks run **Monday to Sunday, in UTC**. Unless Renjith names a week, use the
current one:

```bash
node -e 'const d=new Date();d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));console.log(d.toISOString().slice(0,10))'
```

The folder is `app/weekly/content/<monday>/`. Create it if it doesn't
exist. List what's already in it, so you add only new updates and never
duplicate one.

If Renjith pasted links, add those first. Then look for anything else
worth adding, unless he said to add only his links.

## 2. Research

**What counts:** releases and real changes in AI agents. That covers new
models, agent products and features, coding agents (Claude Code, Codex,
Cursor, Copilot…), agent tooling and protocols (MCP, SDKs), and notable
results from agents.

**What doesn't:** funding, hiring, opinion threads, benchmarks without a
release, rumours, and anything unconfirmed by the company itself.

**Where to look** (official sources first):

| Source | Pages | X accounts |
|---|---|---|
| Anthropic | anthropic.com/news, Claude release notes, Claude Code changelog | @AnthropicAI, @claudeai |
| OpenAI | openai.com/news, the ChatGPT and Codex release notes | @OpenAI, @OpenAIDevs, @ChatGPTapp |
| Google | blog.google, deepmind.google, Gemini release notes | @GoogleDeepMind, @GeminiApp, @googleaidevs |
| xAI | x.ai/news | @xai, @grok |
| Cursor | cursor.com/changelog | @cursor_ai |
| GitHub Copilot | github.blog/changelog | @github |
| Others | Meta AI, Perplexity, Hugging Face, Mistral blogs | their official accounts |

Use WebSearch with the week's dates, e.g. `Anthropic announcement October 2026`,
and `site:x.com <account> <product>` to find the announcement post.

**Tweet IDs:** use only IDs you've actually seen in a URL like
`x.com/<account>/status/<id>`, taken from a search result, an official page
or a link Renjith pasted. **Never guess or construct an ID.** If you can't
find the post, link the announcement page instead of embedding a tweet.

## 3. Write one file per update

`app/weekly/content/<monday>/<slug>.mdx`, where the slug is short and kebab-case
(`claude-haiku-5-5`). The slug is also the popup's `?id=`, so never rename a
file once it's committed.

```mdx
---
title: Claude Haiku 5.5
source: Anthropic
date: 2026-10-28
category: Claude
---
Two or three sentences in your own words: what shipped, who gets it, and why
it matters. Plain and factual, no hype.

<Tweet id="2108271552991252810" />

[Announcement](https://www.anthropic.com/news/...)
```

- **Frontmatter is flat `key: value` lines.** Quote a value if it has `: ` in it.
- **`title`:** a short headline, not the company's marketing line.
- **`source`:** use one of the names that have an icon in
  `app/weekly/sources.tsx`: Anthropic, OpenAI, Google, Gemini, xAI, Meta,
  Perplexity, GitHub Copilot, Hugging Face, Other. Any other source (Cursor,
  Mistral) works but shows a letter badge.
- **`date`:** the day it was announced (UTC). It must fall within the week,
  or the build fails.
- **`category`:** the product line (Claude, Claude Code, Codex, ChatGPT,
  Gemini, Grok, Cursor…). It is shown as "Filed under".
- **Body:** the summary first, then one or more `<Tweet>` (the announcement
  and any important follow-ups in its thread), then links.
- **Your own words:** never copy text from the announcement, news articles or
  agentnative.inc.

**The week's summary:** keep `_week.mdx` up to date, a single sentence on the
week's main stories:

```mdx
---
summary: Claude Haiku 5.5 ships, Codex tasks move to the cloud, and Grok Bot gets email.
---
```

## 4. Check

From the repo root, using Node 24 (`nvm use 24.14.1`):

```bash
node .claude/skills/weekly/check-tweets.mjs <monday>   # every tweet loads
pnpm build                                             # frontmatter and dates are valid
```

Fix every `MISSING`. A `WARN` (tweet posted outside the week) is fine when the
date in the frontmatter is right.

## 5. Hand over

Show Renjith a table of what you added (source, title, date, tweets) and
anything you skipped and why. **Don't commit until he approves.** Then commit
only that week's folder:

```
content(weekly): add <n> updates for the week of <Mon D>
```

Never push unless he asks.
