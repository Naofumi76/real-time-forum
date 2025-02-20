export function showPosts(posts) {
    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
		console.log(post)
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

        if (post.picture) {
            const image = document.createElement("img");
            image.src = post.picture;
            postDiv.appendChild(image);
        }

        const commentsButton = document.createElement("button");
        commentsButton.textContent = "Comments";
        commentsButton.addEventListener("click", function() {
            // Implement comment fetching logic here
        });
        postDiv.appendChild(commentsButton);

        postContainer.appendChild(postDiv);
    });
}

export async function getPosts() {
    return await fetch('/api/posts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            showPosts(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Optionally, display an error message to the user
            const postContainer = document.getElementById("postContainer");
            postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        });
}

export function createPost() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.cssText = `
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.cssText = `
        background-color: #fefefe;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
    `;

    const title = document.createElement("textarea");
    title.id = "postTitle";
    title.placeholder = "Enter post title";
    title.style.width = "100%";
    title.style.marginBottom = "10px";

    const content = document.createElement("textarea");
    content.id = "postContent";
    content.placeholder = "Enter post content";
    content.style.width = "100%";
    content.style.height = "100px";
    content.style.marginBottom = "10px";

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

	const formData = {
		title: document.getElementById("postTitle").value,
        content: document.getElementById("postContent").value,
        picture: document.getElementById("postImage").files[0],
        sender: {
            username: "NathanTemp"
        }
	}

	if (!formData.title || !formData.content || !formData.picture || !formData.sender) {
		alert("Please fill in all required fields.");
        return;
	}

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
	.then((data) => {
		if (data.success) {
			alert(data.message);
			document.getElementById("postContainer").innerHTML = ""
            getPosts();
		} else {
			alert("Error: " + data.message);
		}
	})
	.catch((error) => console.error("Error:" , error))


    // Close the modal after submission
    document.body.removeChild(document.querySelector(".modal"));
}

export function showComments() {
	var comments = getComments()
	var commentsDiv, ul
    commentsDiv = document.createElement("div")
    commentsDiv.className = "comments"
	
    ul = document.createElement("ul")
    for (var i = 0; i < comments.length; i++) {
		var li = document.createElement("li")
		var image = document.createElement("img")
		var h3 = document.createElement("h3")
		h3.textContent = comments[i].username
		image.src = comments[i].image
        li.textContent = comments[i].content
        ul.appendChild(h3)
		if (image.src!== '') {
            li.appendChild(image)
        }
        ul.appendChild(li)
    }

    commentsDiv.appendChild(ul)

    document.getElementById("postContainer").appendChild(commentsDiv)
}

export function getComments() {

}