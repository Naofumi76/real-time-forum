import * as post from './post.js';
import { displaySideBar } from './sideBar.js';
import { getCurrentUser } from './user.js';

export function homePage() {
    document.body.innerHTML = "";

    let user = getCurrentUser()

    const h1 = document.createElement("h1");
    h1.textContent = `Welcome ${ user.username}  to the Forum !`;
	h1.id = "welcomeMessage"
    document.body.appendChild(h1);
    
    displaySideBar();
    
    const postContainer = document.createElement("div");
    postContainer.id = "postContainer";
    document.body.appendChild(postContainer);

    post.getPosts();
}
