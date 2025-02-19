import * as post from './post.js';

export function homePage() {
    document.body.innerHTML = "";

    const h1 = document.createElement("h1");
    h1.textContent = "Welcome to the Forum!";
    document.body.appendChild(h1);

    const postContainer = document.createElement("div");
    postContainer.id = "postContainer";
    document.body.appendChild(postContainer);

    post.getPosts();
}