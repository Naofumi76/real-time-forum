export async function showComments(postId) {
    const comments = await getComments(postId);
    if (!comments) return; // Exit if there was an error fetching comments

     // Clear any existing comments
     const existingComments = document.querySelector('.comments');
     if (existingComments) {
         existingComments.remove();
     }

     var commentsDiv = document.createElement("div");
     commentsDiv.className = "comments";

     var ul = document.createElement("ul");
     for (var i = 0; i < comments.length; i++) {
         var li = document.createElement("li");
         var h3 = document.createElement("h3");
         h3.textContent = comments[i].Sender.Username;
         li.appendChild(h3);

         var content = document.createElement("p");
         content.textContent = comments[i].Content;
         li.appendChild(content);

         if (comments[i].Picture) {
             var image = document.createElement("img");
             image.src = `data:image/png;base64,${comments[i].Picture}`;
             image.style.maxWidth = "200px";
             li.appendChild(image);
         }

         ul.appendChild(li);
     }

     commentsDiv.appendChild(ul);

     // Append comments to the corresponding post div
     const postDiv = document.querySelector(`.post h2:contains("${postId}")`).closest('.post');
     postDiv.appendChild(commentsDiv);
}

export async function getComments(postId) {
    try {
        const response = await fetch(`/api/comments?post_id=${postId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received data:", data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display an error message to the user
        const postContainer = document.getElementById("postContainer");
        postContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
        return null;
    }
}
