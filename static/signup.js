import { homePage } from "./home.js"
import * as session from "./session.js"

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
	inputEmail.required = true
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

export function submitSignupForm(event) {
    event.preventDefault(); // Prevent page reload

    // Collect all form data
    const formData = {
        username: document.querySelector("input[placeholder='Your username']").value.trim(),
        email: document.querySelector("input[placeholder='Your email']").value.trim(),
        password: document.querySelector("input[placeholder='Your password']").value.trim(),
        age: parseInt(document.querySelector("input[placeholder='Your age']").value.trim()) || 0,
        gender: document.querySelector("input[placeholder='Your gender']").value.trim(),
        first_name: document.querySelector("input[placeholder='Your first name']").value.trim(),
        last_name: document.querySelector("input[placeholder='Your last name']").value.trim(),
    };

    // Basic client-side validation
    if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        alert("Please fill in all required fields.");
        return;
    }

    fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
		credentials: "include",
    })
        .then(async (response) => {
            const text = await response.text();
            try {
                return JSON.parse(text); // Parse only if valid JSON
            } catch {
                throw new Error("Invalid JSON response from server");
            }
        })
        .then((data) => {
            if (data.success) {
                alert(data.message);
				session.getUserFromSession().then(() => {
					homePage(); // Load homepage only on success
				});
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch((error) => console.error("Error:", error));
}
