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
	signupButton.addEventListener('click', signupPage);
	loginButton = document.getElementById('loginButton');
	loginButton.addEventListener('click', loginPage);
}

export function signupPage() {
	var formSignup, h1Signup, inputUsername, inputPassword, inputEmail, inputAge, inputGender, inputFirstName, inputLastName, inputPassword, submitButton
	document.body.innerHTML = ""
	formSignup = document.createElement('form')
	formSignup.id ='signupDiv'

	h1Signup = document.createElement('h1')
	h1Signup.textContent = 'Sign Up to the forum'
	formSignup.appendChild(h1Signup)

	inputUsername = document.createElement('input')
	inputUsername.type = 'text'
	inputUsername.placeholder = 'Your username'
	formSignup.appendChild(inputUsername)
	
	inputEmail = document.createElement('input')
	inputEmail.type = 'email'
	inputEmail.placeholder = 'Your email'
	formSignup.appendChild(inputEmail)
	
	inputAge = document.createElement('input')
	inputAge.type = 'number'
	inputAge.placeholder = 'Your age'
	formSignup.appendChild(inputAge)
	
	inputGender = document.createElement('input')
	inputGender.type = 'text'
	inputGender.placeholder = 'Your gender'
	formSignup.appendChild(inputGender)

	inputFirstName = document.createElement('input')
	inputFirstName.type = 'text'
	inputFirstName.placeholder = 'Your first name'
	formSignup.appendChild(inputFirstName)
	
	inputLastName = document.createElement('input')
	inputLastName.type = 'text'
	inputLastName.placeholder = 'Your last name'
	formSignup.appendChild(inputLastName)
	

	inputPassword = document.createElement('input')
	inputPassword.type = 'password'
	inputPassword.placeholder = 'Your password'
	formSignup.appendChild(inputPassword)

	
	submitButton = document.createElement('button')
	submitButton.textContent = 'Sign Up'
	submitButton.addEventListener('click', submitSignupForm)
	formSignup.appendChild(submitButton)


	document.body.appendChild(formSignup)
}

export function submitSignupForm() {
	console.log('Form submitted')
    // Add your code here to validate and submit the form data
    // For example, you can use AJAX to send the form data to a server for further processing
}

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

export function submitLoginForm() {
	console.log('Form submitted')
    // Add your code here to validate and submit the form data
    // For example, you can use AJAX to send the form data to a server for further processing
}