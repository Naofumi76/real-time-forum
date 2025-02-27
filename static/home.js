import * as post from './post.js';
import { displaySideBar } from './sideBar.js';
import * as session from './session.js';

export function homePage() {
    document.body.innerHTML = "";

    const h1 = document.createElement("h1");
    h1.textContent = "Welcome to the Forum!";
	h1.id = "welcomeMessage"
    document.body.appendChild(h1);
    
    displaySideBar();
    
    const postContainer = document.createElement("div");
    postContainer.id = "postContainer";
    document.body.appendChild(postContainer);

    post.getPosts();
}

document.addEventListener("DOMContentLoaded", session.checkSession);