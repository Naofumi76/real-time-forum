export function contactPage(conversations, onlineUsers) {
	var contactContainer, onlineUserContainer
    document.body.innerHTML = ""

	contactContainer = document.createElement("div")
	contactContainer.style.paddingLeft = "5%"
	contactContainer.className = "contactContainer"

	// Create the contact list
	conversations.forEach(user => {
		var conversation = document.createElement("div")
		conversation.textContent = user
		conversation.addEventListener("click", openPrivateMessage("TEMP UNTIL SESSION", user))
		contactContainer.appendChild(conversation)
	})


    onlineUserContainer = document.createElement("div")
	onlineUserContainer.style.paddingRight = "5%"
	onlineUserContainer.className = "onlineUserContainer"
	onlineUserContainer.textContent = "Online Users:"

	// Create the online user list
	onlineUsers.forEach(user => {
		var onlineUser = document.createElement("div")
        onlineUser.textContent = user
		onlineUser.addEventListener("click", openPrivateMessage("TEMP UNTIL SESSION", user))
        onlineUserContainer.appendChild(onlineUser)
	})

    document.body.appendChild(contactContainer)
	document.body.appendChild(onlineUserContainer)

}

export function openPrivateMessage(firstUser, secondUser) {
	document.body.innerHTML = ""
	var messageContainer = document.createElement("div")

	// Expecting messages to contain object message with values .Content and .Sender
	var messages = getMessages(firstUser, secondUser)
	
	// For each message, create the visual
	messages.forEach(message => {
		var finalMessage = document.createElement("div")
		var messageContent = document.createElement("p")
		messageContent.textContent = message.Content

		var messageSender = document.createElement("p")
		messageSender.textContent = message.Sender

		finalMessage.appendChild(messageContent)
		finalMessage.appendChild(messageSender)

		messageContainer.appendChild(finalMessage)
	})

	document.body.appendChild(messageContainer)

	// Area to write the message to send
	var sendMessageForm = document.createElement("input")
	sendMessageForm.type = "text"
	sendMessageForm.id = "sendMessageForm"

	// Send message when pressing "Enter"
	sendMessageForm.addEventListener("keydown", function(event) {
		if (event.key === "Enter") {
            sendMessage(firstUser, secondUser, sendMessageForm.value)
            sendMessageForm.value = ""
        }
	})

	// Send message when clicking the button
	var sendMessageButton = document.createElement("button")
	sendMessageButton.textContent = "->"
	sendMessageButton.addEventListener("click", function() {
        sendMessage(firstUser, secondUser, sendMessageForm.value)
        sendMessageForm.value = ""
    })

	document.body.appendChild(sendMessageForm)
	document.body.appendChild(sendMessageButton)
}


export function sendMessage(firstUser, secondUser, messageContent) {
	const message = messageContent
	// If the user tries to send an empty message
	if (!message) {
		alert("Please enter a message!")
		return
	}

	// Create the message data and send it to the server
	const formData = {
		message: message,
        sender: firstUser,
        receiver: secondUser
	}
	fetch("http://localhost:8080/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
	.then(async (response) => {
        const text = await response.text()
        try {
            return JSON.parse(text)
        } catch {
            throw new Error("Invalid JSON response from server")
        }
    })
	.then((data) => {
		if (data.success) {
			// If message successfully sent, get the latest messages
            alert(data.message)
			document.getElementById("messageContainer").innerHTML = ""
			openPrivateMessage(firstUser, secondUser)
        } else {
            alert("Error: " + data.message)
        }
	})
	.catch((error) => console.error("Error:", error));
}

export function getMessages(firstUser, secondUser) {
	// Fetch messages from the server
    return fetch(`http://localhost:8080/getMessages?sender=${firstUser}&receiver=${secondUser}`)
        .then(async (response) => {
            const text = await response.text()
            try {
                return JSON.parse(text)
            } catch {
                throw new Error("Invalid JSON response from server")
            }
        })
        .then((data) => {
            if (data.success) {
                return data.messages
            } else {
                throw new Error("Error: " + data.message)
            }
        })
        .catch((error) => console.error("Error:", error))
}