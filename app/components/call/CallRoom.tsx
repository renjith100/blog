"use client";

import {
	BarVisualizer,
	LiveKitRoom,
	RoomAudioRenderer,
	useConnectionState,
	useLocalParticipant,
	useRoomContext,
	useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ConnectionState, RoomEvent } from "livekit-client";
import { useEffect } from "react";

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
	const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
	const room = useRoomContext();
	const connection = useConnectionState();

	// End the visitor's call when the last remote leaves — e.g. the host hangs
	// up on the phone, or the agent ends a screened-out call. ParticipantDisconnected
	// only fires after someone was present, so it won't trip while we wait for the agent.
	useEffect(() => {
		const onRemoteLeft = () => {
			if (room.remoteParticipants.size === 0) void room.disconnect();
		};
		room.on(RoomEvent.ParticipantDisconnected, onRemoteLeft);
		return () => {
			room.off(RoomEvent.ParticipantDisconnected, onRemoteLeft);
		};
	}, [room]);

	// Drive connecting/connected off the room connection (reliable); use the
	// agent state only for the "talking" flourish.
	const status =
		connection !== ConnectionState.Connected
			? "Connecting…"
			: state === "listening" || state === "thinking" || state === "speaking"
				? "Talking to assistant"
				: "Connected";

	const toggleMute = () => {
		void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
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
					{isMicrophoneEnabled ? "Mute" : "Unmute"}
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
