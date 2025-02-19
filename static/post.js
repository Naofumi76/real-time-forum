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