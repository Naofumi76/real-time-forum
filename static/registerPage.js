import * as signup from "./signup.js"
import * as login from "./login.js"


export function createIndexButton() {
	document.body.innerHTML = ""
	var signupButton = document.createElement('button');
	signupButton.textContent = 'Signup';
	signupButton.id = 'signupButton';
	document.body.appendChild(signupButton);

	var loginButton = document.createElement('button');
	loginButton.textContent = 'Login';
	loginButton.id = 'loginButton';
	document.body.appendChild(loginButton);
}

export function indexListener() {
	let signupButton = document.getElementById('signupButton');
	signupButton.addEventListener('click', signup.signupPage);
	let loginButton = document.getElementById('loginButton');
	loginButton.addEventListener('click', login.loginPage);
}
