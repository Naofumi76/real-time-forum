import * as post from './post.js';

export function homePage() {
    document.body.innerHTML = "";

    const h1 = document.createElement("h1");
    h1.textContent = "Welcome to the Forum!";
    document.body.appendChild(h1);

    const postContainer = document.createElement("div");
    postContainer.id = "postContainer";
    document.body.appendChild(postContainer);

	const createPost = document.createElement("div") 
	createPost.textContent = "+"
	createPost.style.cursor = "pointer"
	createPost.style.background = "blue"
	createPost.addEventListener("click", post.createPost)
	document.body.appendChild(createPost)
	
    post.getPosts();
}