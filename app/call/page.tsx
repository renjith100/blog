import { CallExperience } from "app/components/call/CallExperience";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Call",
	description: "Call me — talk to my assistant and reach me live.",
};

export default function Page() {
	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	if (!backendUrl) {
		return (
			<section>
				<h1>Call</h1>
				<p className="paragraph-main">
					Set NEXT_PUBLIC_BACKEND_URL to enable the call page.
				</p>
			</section>
		);
	}

	return <CallExperience backendUrl={backendUrl} />;
}
