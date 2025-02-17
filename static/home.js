import * as post from './post.js';

export function homePage() {
	var postContainer
	document.body.innerHTML=""

	postContainer = document.createElement("div")
	postContainer.id = "postContainer"
	document.body.appendChild(postContainer)
}

post.showPost()