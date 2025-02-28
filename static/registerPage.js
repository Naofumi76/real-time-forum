import * as signup from "./signup.js"
import * as login from "./login.js"

var authentification = document.createElement('div');
    authentification.id ='authentification';
	var authH1 = document.createElement('h1');
	authH1.textContent = 'Authentication';
	authentification.appendChild(authH1);
	document.body.appendChild(authentification);


var signupButton = document.createElement('button');
	signupButton.textContent = 'Signup';
	signupButton.id ='signupButton';
	authentification.appendChild(signupButton);

var loginButton = document.createElement('button');
	loginButton.textContent = 'Login';
	loginButton.id ='loginButton';
	authentification.appendChild(loginButton);

export function indexListener() {
	signupButton = document.getElementById('signupButton');
	signupButton.addEventListener('click', signup.signupPage);
	loginButton = document.getElementById('loginButton');
	loginButton.addEventListener('click', login.loginPage);
}
