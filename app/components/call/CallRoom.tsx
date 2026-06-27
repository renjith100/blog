"use client";

import {
	BarVisualizer,
	LiveKitRoom,
	RoomAudioRenderer,
	useLocalParticipant,
	useRoomContext,
	useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useState } from "react";

export default function CallRoom({
	serverUrl,
	token,
	onDone,
}: {
	serverUrl: string;
	token: string;
	onDone: () => void;
}) {
	return (
		<LiveKitRoom
			serverUrl={serverUrl}
			token={token}
			connect
			audio
			video={false}
			onDisconnected={onDone}
			data-lk-theme="default"
			className="call-room"
		>
			<RoomAudioRenderer />
			<CallStage />
		</LiveKitRoom>
	);
}

function CallStage() {
	const { state, audioTrack } = useVoiceAssistant();
	const { localParticipant } = useLocalParticipant();
	const room = useRoomContext();
	const [muted, setMuted] = useState(false);

	const status =
		state === "connecting" || state === "initializing"
			? "Connecting…"
			: state === "listening" || state === "thinking" || state === "speaking"
				? "Talking to assistant"
				: "Connected";

	const toggleMute = () => {
		const next = !muted;
		setMuted(next);
		void localParticipant.setMicrophoneEnabled(!next);
	};

	return (
		<div className="call-stage">
			<BarVisualizer
				state={state}
				trackRef={audioTrack}
				barCount={15}
				className="call-visualizer"
			/>
			<p className="call-status">{status}</p>
			<div className="call-controls">
				<button type="button" onClick={toggleMute}>
					{muted ? "Unmute" : "Mute"}
				</button>
				<button
					type="button"
					className="call-end"
					onClick={() => room.disconnect()}
				>
					End call
				</button>
			</div>
		</div>
	);
}
