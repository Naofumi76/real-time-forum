import { homePage } from "./home.js"
import * as session from "./session.js"
import { showPopup } from "./utils.js"

export function loginPage() {
	var formLogin, h1Login, inputUsername, inputEmail, inputPassword, submitButton
	document.body.innerHTML = ""
    formLogin = document.createElement('form')
    formLogin.id = 'loginDiv'

    h1Login = document.createElement('h1')
    h1Login.textContent = 'Login'
    formLogin.appendChild(h1Login)

	inputUsername = document.createElement('input')
	inputUsername.type = 'text'
	inputUsername.placeholder = 'Your username or email'
	formLogin.appendChild(inputUsername)

    inputPassword = document.createElement('input')
    inputPassword.type = 'password'
    inputPassword.placeholder = 'Your password'
    formLogin.appendChild(inputPassword)

	submitButton = document.createElement('button')
	submitButton.className = 'btn-primary'
	submitButton.textContent = 'Login'
	submitButton.addEventListener('click', submitLoginForm)

	formLogin.appendChild(submitButton)

	document.body.appendChild(formLogin)
}

export function submitLoginForm(event) {
	event.preventDefault(); // Prevent page reload

	const formData = {
		username: document.querySelector("input[placeholder='Your username or email']").value.trim(),
		password: document.querySelector("input[placeholder='Your password']").value.trim(),
	};

	fetch("http://localhost:8080/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(formData),
	})
		.then(async (response) => {
			const text = await response.text();
			try {
				return JSON.parse(text);
			} catch (error) {
				throw new Error("Invalid JSON response from server: " + text);
			}
		})
		.then((data) => {
			//console.log("data: ",data)
			if (data.success) {
                // Wait for the session to be set up before loading the homepage
                session.getUserFromSession().then(() => {
                    homePage(); // Load homepage only on success
                });
			} else {
				// console.error("Login failed:", data.message);
				showPopup("User not found, please login again");
			}
		})
		.catch((error) => console.error("Error:", error));
}
