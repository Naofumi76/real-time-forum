import * as user from './user.js'
import * as start from './registerPage.js'

export async function getUserFromSession() {
	return fetch("http://localhost:8080/get-user-session", { credentials: "include" })
		.then((res) => res.json())
		.then((data) => {
			if (data.success) {
				var currentUser = {
					ID: data.id,
					username: data.username,
					email: data.email,
					age: data.age,
					gender: data.gender,
					firstname: data.firstname,
					lastname: data.lastname,
				}
				user.setCurrentUser(currentUser)
				console.log("user :", currentUser)
				return user;
			} else {
				return null;
			}
		})
		.catch((error) => {
			console.error("Error getting user:", error);
			return null;
		});
}

export function disconnectUser() {
	fetch("http://localhost:8080/logout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({}),
	})
	
}