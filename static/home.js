import * as post from './post.js';

export function homePage() {
	var postContainer
	document.body.innerHTML=""

	var h1 = document.createElement("h1")
	h1.textContent = "Welcome to the Forum!"
	document.body.appendChild(h1)

	postContainer = document.createElement("div")
	postContainer.id = "postContainer"
	document.body.appendChild(postContainer)

}