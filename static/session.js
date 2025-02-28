import * as user from './user.js'

export async function getUserFromSession() {
	return fetch("http://localhost:8080/get-user-session", { credentials: "include" })
		.then((res) => res.json())
		.then((data) => {
			if (data.success) {
				var currentUser = {
					ID: data.id,
                    username: data.username,
					email: data.email,
					age : data.age,
					gender: data.gender,
					firstname: data.firstname,
					lastname: data.lastname,
				}
				user.setCurrentUser(currentUser)
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
