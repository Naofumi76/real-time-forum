import * as home from "./home.js"
	export function checkSession() {
		fetch("http://localhost:8080/check-session", { credentials: "include" })
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					home.homePage(); // Auto-login if session is valid
				}
			})
			.catch((error) => {
				console.error("Error checking session:", error);
			});
	}
