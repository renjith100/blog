export interface VisitorToken {
	token: string;
	url: string;
}

export function newCallRoom(): string {
	return `call-${crypto.randomUUID()}`;
}

export async function fetchVisitorToken(
	backendUrl: string,
	room: string,
): Promise<VisitorToken> {
	// Bound the request so a stalled backend can't leave the caller stuck in
	// "connecting" forever — the rejection surfaces as the call's error state.
	const res = await fetch(`${backendUrl}/api/token`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ room, role: "visitor" }),
		signal: AbortSignal.timeout(10000),
	});
	if (!res.ok) throw new Error(`token failed: ${res.status}`);
	return (await res.json()) as VisitorToken;
}
