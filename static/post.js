import * as comments from './comments.js'
import * as user from './user.js'
import { showPopup } from './utils.js'

export function showPosts(posts) {
    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        if (post.ParentID === 0){

        const postDiv = document.createElement("div");
        postDiv.className = "post";

        const h2 = document.createElement("h2");
        h2.textContent = `Title: ${post.Title}`;
        h2.className = "title";

        const author = document.createElement("p");
        author.textContent = `Posted by: ${post.Sender.Username}`;
        author.className = "sender";

        const content = document.createElement("p");
        content.textContent = `${post.Content}`;
        content.className = "post-content";

        const date = document.createElement("p");
        date.textContent = `Date: ${post.Date}`;
        date.style.cssText = "black";

        postDiv.appendChild(h2);
        postDiv.appendChild(author);
        postDiv.appendChild(content);
        postDiv.appendChild(date);

        if (post.Picture) {
            const image = document.createElement("img");
            image.className = "post-image";
            image.src = `data:image/png;base64,${post.Picture}`; 
            image.style.maxWidth = "300px"; 
            postDiv.appendChild(image);
        }

        const commentsButton = document.createElement("button");
        commentsButton.textContent = "Comments";
        commentsButton.className = "comments";
        commentsButton.addEventListener("click", () => {
			comments.getComments(post)
		});
        postDiv.appendChild(commentsButton);

        postContainer.appendChild(postDiv);
    }
    });
}

export async function getPosts() {
	var posts
    return await fetch('/api/posts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            //console.log("Received data:", data);
			posts = data;
            showPosts(data);
        })
        .catch(error => {
			if (posts) {
				console.error('Error:', error);
				// Optionally, display an error message to the user
				const postContainer = document.getElementById("postContainer");
				postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
			}
        });
}

export function createPost() {
    const modal = document.createElement("div");
    modal.className = "modal";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const title = document.createElement("textarea");
    title.id = "postTitle";
    title.placeholder = "Enter post title";
	title.style.width = "100%";
	title.style.marginBottom = "10px";
    title.rows = "2";

    const content = document.createElement("textarea");
    content.id = "postContent";
    content.placeholder = "Enter post content";
    content.style.width = "100%";
    content.style.height = "100px";
    content.style.marginBottom = "10px";
    content.rows = "6";

    const image = document.createElement("input");
    image.type = "file";
    image.id = "postImage";
    image.accept = "image/*";
	image.style.marginBottom = "10px";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit Post";
    submitButton.onclick = submitPost;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(title);
    modalContent.appendChild(content);
	modalContent.appendChild(image);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(closeButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

export function submitPost() {
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const imageFile = document.getElementById("postImage").files[0];
    const sender_id = user.getCurrentUser().ID; // Change when sessions are available

    if (!title || !content || !sender_id) {
        showPopup("Please fill in all required fields. Title and content cannot be empty.");
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = function () {
            const base64String = reader.result.split(",")[1]; // Extract only the raw Base64 data

            const formData = {
                title: title,
                content: content,
                picture: base64String,
                sender_id: sender_id
            };

            sendPostData(formData);
        };
        reader.onerror = function (error) {
            console.error("Error converting image:", error);
            alert("Failed to process image.");
        };
    } else {
        // If no image, send data without a picture
        const formData = {
            title: title,
            content: content,
            picture: "",
            sender_id: sender_id
        };
        sendPostData(formData);
    }
}

export function sendPostData(formData, commentState = false) {
    fetch("http://localhost:8080/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
    .then(async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text); // Parse only if valid JSON
        } catch {
            throw new Error("Invalid JSON response from server");
        }
    })
    .then(async (data) => {
        if (data.success && !commentState) {
            showPopup(data.message);
            document.getElementById("postContainer").innerHTML = "";
            getPosts();
        } else if (data.success && commentState){
            showPopup('Comment was successfully sent');
            document.getElementById("postContainer").innerHTML = "";

            let post = await getPostById(formData.parent_id);
            await comments.getComments(post);
        } else {
            showPopup("Error: " + data.message);
        }
    })
    .catch((error) => console.error("Error:", error));

    // Close the modal after submission
    const modal = document.querySelector(".modal");
if (modal) {
    document.body.removeChild(modal);
}
}


export async function getPostById(id) {
    return fetch(`http://localhost:8080/api/postID?ParentID=${id}`, {  
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        //console.log("Received post data:", data);
        return data;
    })
    .catch(error => console.error("Error:", error));
}