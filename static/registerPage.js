import * as signup from "./signup.js"
import * as login from "./login.js"

var signupButton = document.createElement('button');
	signupButton.textContent = 'Signup';
	signupButton.id ='signupButton';
	document.body.appendChild(signupButton);

var loginButton = document.createElement('button');
	loginButton.textContent = 'Login';
	loginButton.id ='loginButton';
	document.body.appendChild(loginButton);

export function indexListener() {
	signupButton = document.getElementById('signupButton');
	signupButton.addEventListener('click', signup.signupPage);
	loginButton = document.getElementById('loginButton');
	loginButton.addEventListener('click', login.loginPage);
}
