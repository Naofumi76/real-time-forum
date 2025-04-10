import { sendPostData } from "./post.js";
import { getCurrentUser } from "./user.js";
import { showPopup } from "./utils.js";

export async function showComments(comments, originalPost) {
	function createPostElement(post) {
		const postDiv = document.createElement("div");
		postDiv.className = "post";

		const parent_id = document.createElement("input");
		parent_id.type = "hidden";
		parent_id.id = "parent_id";
		parent_id.value = `${post.ID}`;
		postDiv.appendChild(parent_id);

		const commentTitle = document.createElement("input");
		commentTitle.type = "hidden";
		commentTitle.value = `${post.Title}`;
		commentTitle.id = "comment_title";
		postDiv.appendChild(commentTitle);

	
		const h2 = document.createElement("h2");		
		if (post.ParentID === 0){
			h2.textContent = `Title: ${post.Title}`;
			h2.className = "title";
		} else {
			h2.textContent = `Comment of : ${post.Title}`;
			h2.className = "title";
		}
			
		const author = document.createElement("p");
		author.textContent = `Posted by: ${post.Sender.Username}`;
		author.className = "sender";
	
		const content = document.createElement("p");
		content.textContent = `Content: ${post.Content}`;
		content.className = "post-content";
	
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

	//document.getElementById("welcomeMessage").remove()

    postContainer.innerHTML = "";

	const commentContainer = document.createElement("div");
	commentContainer.id = "commentContainer";

	const originalPostDiv = document.createElement("div");
    // Create and append the original post
    const originalPostContainer = createPostElement(originalPost);

	originalPostDiv.appendChild(originalPostContainer)

	postContainer.appendChild(originalPostDiv);

	if (comments) {
		comments.forEach(comment => {
			const commentDiv = createPostElement(comment);
			commentContainer.appendChild(commentDiv);
		});
	}

	postContainer.appendChild(commentContainer);

    const createCommentDiv = document.createElement("div");	
	createCommentDiv.id = "comment-input-container";

    const commentWrite = document.createElement("input");
	commentWrite.id = "comment-input";
    commentWrite.type = "text";
    commentWrite.placeholder = "Write your comment!";

    const createComment = document.createElement("button");
    createComment.textContent = "Submit";
    createComment.onclick = async () => {
		submitComment();
        // Update this part to create comments
    }

    createCommentDiv.appendChild(commentWrite);
    createCommentDiv.appendChild(createComment);
    document.body.appendChild(createCommentDiv);

}

export async function getComments(post) {
	var comments
    try {
        const response = await fetch(`/api/comments?post_id=${post.ID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //console.log("Received data:", data);
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

function submitComment(){
	const title = document.getElementById("comment_title").value;
	const content = document.getElementById("comment-input").value.trim();
	const parent_id = document.getElementById("parent_id").value;
	const sender_id = getCurrentUser().ID; 

	if (!content){
		showPopup("Please write a comment. Comment cannot be empty.");
        return;
	}
	
	const formData = {
		title: title,
		content: content,
		picture:"",
        parent_id: parent_id ? parseInt(parent_id) : null,
        sender_id: sender_id
	}

	document.getElementById('comment-input-container').remove();
	sendPostData(formData, true);
}