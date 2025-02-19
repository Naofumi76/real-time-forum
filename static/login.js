import { homePage } from "./home.js"

export function loginPage() {
	var formLogin, h1Login, inputUsername, inputEmail, inputPassword, submitButton
	document.body.innerHTML = ""
    formLogin = document.createElement('form')
    formLogin.id = 'loginDiv'

    h1Login = document.createElement('h1')
    h1Login.textContent = 'Login to the forum'
    formLogin.appendChild(h1Login)

	inputUsername = document.createElement('input')
	inputUsername.type = 'text'
	inputUsername.placeholder = 'Your username'
	formLogin.appendChild(inputUsername)

    inputEmail = document.createElement('input')
    inputEmail.type = 'email'
    inputEmail.placeholder = 'Your email'
    formLogin.appendChild(inputEmail)

    inputPassword = document.createElement('input')
    inputPassword.type = 'password'
    inputPassword.placeholder = 'Your password'
    formLogin.appendChild(inputPassword)

	submitButton = document.createElement('button')
	submitButton.textContent = 'Login'
	submitButton.addEventListener('click', submitLoginForm)

	formLogin.appendChild(submitButton)

	document.body.appendChild(formLogin)
}

export function submitLoginForm(event) {
	event.preventDefault(); // Prevent page reload

	const formData = {
		email: document.querySelector("input[placeholder='Your email']").value.trim(),
		username: document.querySelector("input[placeholder='Your username']").value.trim(),
		password: document.querySelector("input[placeholder='Your password']").value.trim(),
	};

	fetch("http://localhost:8080/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
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
			if (data.success) {
				console.log("Login successful");
				homePage(); // Load homepage only on success
			} else {
				console.error("Login failed:", data.message);
			}
		})
		.catch((error) => console.error("Error:", error));
}
