export function showPost() {
	var post = getPosts()
	var postDiv, h2, p, image, commentsButton
	postDiv = document.createElement("div")
	postDiv.className = "post"

	h2 = document.createElement("h2")
	h2.textContent = post.username

	p = document.createElement("p")
	p.textContent = post.content

	image = document.createElement("img")
	image.src = post.image

	postDiv.appendChild(h2)
	if (image.src !== '') {
		postDiv.appendChild(image)
	}
	postDiv.appendChild(p)

	commentsButton = document.createElement("button")
	commentsButton.textContent = "Comments (" + post.comments.length + ")"
	commentsButton.addEventListener("click", function() {


    })
	postDiv.appendChild(commentsButton)

	document.getElementById("postContainer").appendChild(postDiv)
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

export function getPosts() {

}

export function getComments() {

}