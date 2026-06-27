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
	const res = await fetch(`${backendUrl}/api/token`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ room, role: "visitor" }),
	});
	if (!res.ok) throw new Error(`token failed: ${res.status}`);
	return (await res.json()) as VisitorToken;
}
