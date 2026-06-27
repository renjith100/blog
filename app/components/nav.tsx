import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const navItems = {
	"/": {
		name: "home",
	},
	"/blog": {
		name: "blog",
	},
	// Only advertise /call where the backend URL is configured, so preview/local
	// deployments without it don't show a dead primary-nav route.
	...(process.env.NEXT_PUBLIC_BACKEND_URL
		? {
				"/call": {
					name: "call",
				},
			}
		: {}),
};

export function Navbar() {
	return (
		<aside className="nav-container">
			<div className="layout-sidebar">
				<nav className="nav-menu">
					<div className="nav-group">
						{Object.entries(navItems).map(([path, { name }]) => {
							return (
								<Link key={path} href={path} className="nav-item">
									{name}
								</Link>
							);
						})}
					</div>
					<ThemeToggle />
				</nav>
			</div>
		</aside>
	);
}
