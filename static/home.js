import * as post from './post.js';

export function homePage() {
    document.body.innerHTML = "";

    const h1 = document.createElement("h1");
    h1.textContent = "Welcome to the Forum!";
	h1.id = "welcomeMessage"
    document.body.appendChild(h1);

    const postContainer = document.createElement("div");
    postContainer.id = "postContainer";
    document.body.appendChild(postContainer);

	const createPost = document.createElement("button")
	createPost.id = "createPostButton"
	createPost.textContent = "Créer un post"
	createPost.style.cursor = "pointer"
	createPost.addEventListener("click", post.createPost)
	document.body.appendChild(createPost)
	
    post.getPosts();
}