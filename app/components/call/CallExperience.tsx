"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "./call.css";
import { fetchVisitorToken, newCallRoom } from "./lkClient";

const CallRoom = dynamic(() => import("./CallRoom"), { ssr: false });

type Phase =
	| { kind: "idle" }
	| { kind: "connecting" }
	| { kind: "in-call"; serverUrl: string; token: string }
	| { kind: "error" };

export function CallExperience({ backendUrl }: { backendUrl: string }) {
	const [phase, setPhase] = useState<Phase>({ kind: "idle" });

	const start = async () => {
		setPhase({ kind: "connecting" });
		try {
			const room = newCallRoom();
			const { token, url } = await fetchVisitorToken(backendUrl, room);
			setPhase({ kind: "in-call", serverUrl: url, token });
		} catch {
			setPhase({ kind: "error" });
		}
	};

	if (phase.kind === "in-call") {
		return (
			<CallRoom
				serverUrl={phase.serverUrl}
				token={phase.token}
				onDone={() => setPhase({ kind: "idle" })}
			/>
		);
	}

	return (
		<section className="call-intro">
			<h1>Call</h1>
			<p className="paragraph-main">
				Talk to my assistant — if it's a genuine call, my phone rings and we
				talk live.
			</p>
			{phase.kind === "error" && (
				<p className="call-error">Couldn't start the call. Please try again.</p>
			)}
			<button
				type="button"
				className="call-start"
				onClick={start}
				disabled={phase.kind === "connecting"}
			>
				{phase.kind === "connecting" ? "Connecting…" : "Start call"}
			</button>
		</section>
	);
}
