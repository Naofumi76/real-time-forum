import * as home from "./home.js";

export async function showComments(comments, originalPost) {
	function createPostElement(post) {
		const postDiv = document.createElement("div");
		postDiv.className = "post";
	
		const h2 = document.createElement("h2");
		h2.textContent = `Title: ${post.Title}`;
	
		const author = document.createElement("p");
		author.textContent = `Posted by: ${post.Sender.Username}`;
	
		const content = document.createElement("p");
		content.textContent = `Content: ${post.Content}`;
	
		const date = document.createElement("p");
		date.textContent = `Date: ${post.Date}`;
	
		postDiv.appendChild(h2);
		postDiv.appendChild(author);
		postDiv.appendChild(content);
		postDiv.appendChild(date);
	
		if (post.Picture) {
			const image = document.createElement("img");
			image.src = `data:image/png;base64,${post.Picture}`;
			image.style.maxWidth = "300px";
			postDiv.appendChild(image);
		}
	
		return postDiv;
	}

	document.getElementById("welcomeMessage").remove()
	document.getElementById("createPostButton").remove()

    postContainer.innerHTML = "";


	const originalPostDiv = document.createElement("div");
    // Create and append the original post
	const originalPostText = document.createElement('p')
	originalPostText.textContent = `Original post : `;
    const originalPostContainer = createPostElement(originalPost);

    originalPostDiv.appendChild(originalPostText)
	originalPostDiv.appendChild(originalPostContainer)

	postContainer.appendChild(originalPostDiv);

	if (comments) {
		comments.forEach(comment => {
			const commentDiv = createPostElement(comment);
			postContainer.appendChild(commentDiv);
		});
	}

    const createCommentDiv = document.createElement("div");

    const commentWrite = document.createElement("input");
    commentWrite.type = "text";
    commentWrite.placeholder = "Write your comment!";

    const createComment = document.createElement("button");
    createComment.textContent = "Submit";
    createComment.onclick = async () => {
        // Update this part to create comments
    }

    createCommentDiv.appendChild(commentWrite);
    createCommentDiv.appendChild(createComment);
    document.body.appendChild(createCommentDiv);

    const homeButton = document.createElement("button");
    homeButton.textContent = "Home";

    const handleClick = () => {
        postContainer.innerHTML = "";
        createCommentDiv.remove();
        homeButton.removeEventListener("click", handleClick);
        homeButton.remove();
        home.homePage();
    };

    homeButton.addEventListener("click", handleClick);
    document.body.appendChild(homeButton);
}

export async function getComments(post) {
	var comments
    try {
        const response = await fetch(`/api/comments?post_id=${post.ID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received data:", data);
		comments = data
		showComments(data, post)
    } catch (error) {
		if (comments) {
			console.error('Error:', error);
			// Optionally, display an error message to the user
			const postContainer = document.getElementById("postContainer");
			postContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
		}
    }
}
