// Records scene.html frame by frame through Chrome's DevTools protocol (no extra packages).
// Usage: node record.mjs <scene.html> <outDir> <fps> [t1,t2,... for stills only]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [scene, outDir, fpsArg, stills] = process.argv.slice(2);
const fps = Number(fpsArg) || 30;
fs.mkdirSync(outDir, { recursive: true });
const profile = fs.mkdtempSync(
	path.join(path.dirname(outDir), "chrome-profile-"),
);
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	[
		"--headless=new",
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profile}`,
		"--hide-scrollbars",
		"--window-size=1920,1080",
		"--allow-file-access-from-files",
		"--no-first-run",
		"about:blank",
	],
	{ stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// If Chrome is missing or dies, fail with a clear message instead of hanging
let chromeError = null;
chrome.on("error", (err) => {
	chromeError = err;
});
const pending = new Map();
const failAll = (reason) => {
	for (const settle of pending.values()) settle({ error: reason });
	pending.clear();
};
chrome.on("exit", () => failAll("Chrome exited"));
let ws;
let id = 0;
const send = (method, params = {}) =>
	new Promise((res, rej) => {
		const i = ++id;
		pending.set(i, (m) =>
			m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result),
		);
		ws.send(JSON.stringify({ id: i, method, params }));
	});
try {
	let targets;
	for (let i = 0; i < 50 && !targets && !chromeError; i++) {
		try {
			targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
		} catch {
			await sleep(200);
		}
	}
	const page = targets?.find((t) => t.type === "page");
	if (!page) {
		throw new Error(
			`Chrome didn't start${chromeError ? `: ${chromeError.message}` : ""}`,
		);
	}
	ws = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((res, rej) => {
		ws.addEventListener("open", res);
		ws.addEventListener("error", () => rej(new Error("Can't reach Chrome")));
	});
	ws.addEventListener("message", (e) => {
		const m = JSON.parse(e.data);
		if (pending.has(m.id)) {
			pending.get(m.id)(m);
			pending.delete(m.id);
		}
	});
	ws.addEventListener("close", () => failAll("Chrome connection closed"));
	await send("Emulation.setDeviceMetricsOverride", {
		width: 1920,
		height: 1080,
		deviceScaleFactor: 1,
		mobile: false,
	});
	await send("Page.enable");
	await send("Page.navigate", {
		url: `file://${path.resolve(scene)}#record`,
	});
	await sleep(1500);
	await send("Runtime.evaluate", {
		expression: "document.fonts.ready.then(() => document.fonts.size)",
		awaitPromise: true,
	});
	const { result } = await send("Runtime.evaluate", {
		expression: "window.DURATION",
	});
	const times = stills
		? stills.split(",").map(Number)
		: Array.from({ length: Math.round(result.value * fps) }, (_, i) => i / fps);
	for (const [i, t] of times.entries()) {
		const r = await send("Runtime.evaluate", {
			expression: `render(${t}); 1`,
			exceptionDetails: true,
		});
		if (r.exceptionDetails)
			throw new Error(
				`render(${t}) failed: ${r.exceptionDetails.exception?.description}`,
			);
		const shot = await send("Page.captureScreenshot", {
			format: stills ? "png" : "jpeg",
			quality: 94,
		});
		const name = stills
			? `still-${String(t).replace(".", "_")}.png`
			: `${String(i).padStart(5, "0")}.jpg`;
		fs.writeFileSync(path.join(outDir, name), Buffer.from(shot.data, "base64"));
	}
	console.log(`wrote ${times.length} frames`);
} finally {
	ws?.close();
	if (chrome.exitCode === null && chrome.signalCode === null && !chromeError) {
		const exited = new Promise((r) => chrome.once("exit", r));
		chrome.kill();
		await exited;
	}
	await sleep(300);
	try {
		fs.rmSync(profile, { recursive: true, force: true });
	} catch {}
}
