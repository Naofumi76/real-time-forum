export let activeSockets = {}; // Store active WebSocket connections per user
let activeChatUser = null;
export let unreadMessages = {};

export async function openPrivateMessage(firstUser, secondUser) {
    console.log("Opening chat between:", firstUser, secondUser);

    activeChatUser = secondUser;

    // Ensure WebSocket is connected
    const socket = connectWebSocket(firstUser);

    let messageContainer = document.createElement("div");
    messageContainer.className = "message-container";

    let textContainer = document.createElement("div");
    textContainer.className = "text-container";
    textContainer.id = `text-container-${secondUser.ID}`; // Unique ID for real-time updates

    // Chat Header
    let header = document.createElement("div");
    header.className = "chat-header";
    header.textContent = secondUser.Username;
    messageContainer.appendChild(header);

    // Load previous messages from DB
    let messages = await getMessages(firstUser.ID, secondUser.ID) || [];
    messages.forEach(message => displayMessage(message, firstUser, secondUser));

    messageContainer.appendChild(textContainer);

    // Input Field
    let sendMessageInput = document.createElement("input");
    sendMessageInput.type = "text";
    sendMessageInput.placeholder = "Type a message...";
    sendMessageInput.className = "message-input";

    // Send Button
    let sendMessageButton = document.createElement("button");
    sendMessageButton.textContent = "Send";
    sendMessageButton.className = "send-button";

    // Handle sending message on "Enter" key
    sendMessageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMessage(socket, firstUser, secondUser, sendMessageInput.value);
            sendMessageInput.value = "";
        }
    });

    // Handle sending message on button click
    sendMessageButton.addEventListener("click", async function () {
        await sendMessage(socket, firstUser, secondUser, sendMessageInput.value);
        sendMessageInput.value = "";
    });

    messageContainer.appendChild(sendMessageInput);
    messageContainer.appendChild(sendMessageButton);

    document.body.appendChild(messageContainer);
}

// WebSocket Connection (Reused if Already Connected)
export function connectWebSocket(user) {
    if (activeSockets[user.ID]) {
        return activeSockets[user.ID]; // Reuse existing connection
    }

    const socket = new WebSocket(`ws://localhost:8080/ws?user=${user.ID}`);

    socket.onopen = function () {
        console.log(`Connected to WebSocket as ${user.Username}`);
    };

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        console.log("📩 New private message received:", message, activeChatUser, message.Sender.Username);
    
        if (activeChatUser && activeChatUser.Username === message.Sender.Username) {
            // If chat is open, display the message in the chat
            displayMessage(message, user, message.Sender);
        } else {
            // If chat is NOT open, show a notification
            showNotification(message);
            unreadMessages[message.Sender.ID] = (unreadMessages[message.Sender.ID] || 0) + 1;

        }

    };

    socket.onclose = function () {
        console.log("WebSocket Disconnected!");
        delete activeSockets[user.ID]; // Remove from active connections
    };

    activeSockets[user.ID] = socket;
    return socket;
}

//  Send Message via WebSocket
export async function sendMessage(socket, sender, receiver, messageContent) {
    if (!messageContent.trim()) return alert("Message cannot be empty!");

	console.log("sendMessage", sender, receiver, messageContent)

    const message = {
        Sender: { ID: sender.ID, Username: sender.username },          // Sender as an object with ID
        Receiver: { ID: receiver.ID, Username: receiver.Username},
        Content: messageContent,		
        date: new Date().toISOString(),
    };

    socket.send(JSON.stringify(message)); // Send message to server
	displayMessage(message, sender, receiver);
}

//  Display Message in Chat Window
function displayMessage(message, firstUser, secondUser) {

    let textContainer = document.querySelector(`.text-container`);

    if (!textContainer) {
        console.warn("⚠️ Text container not found! Retrying in 500ms...");
        setTimeout(() => displayMessage(message, firstUser, secondUser), 500);
        return;
    }

    let finalMessage = document.createElement("div");
    let messageContent = document.createElement("p");
    let messageSender = document.createElement("p");

    // Ensure the message content is not empty
    messageContent.textContent = message.Content || "(No content)";
    messageSender.textContent = message.Sender.ID === firstUser.ID ? "You" : (secondUser ? secondUser.Username : message.Sender.Username);
    
    // Assign classes for styling
    finalMessage.classList.add(
        message.sender === firstUser.ID ? "message-sender-you" : "message-sender-other"
    );
    
    // Append elements properly
    finalMessage.appendChild(messageSender);
    finalMessage.appendChild(messageContent);
    textContainer.appendChild(finalMessage);

    // Auto-scroll to latest message
    textContainer.scrollTop = textContainer.scrollHeight;
}


// Fetch Past Messages from Server
export async function getMessages(firstUserID, secondUserID) {
    console.log("Fetching messages for:", firstUserID, secondUserID);

    try {
        const response = await fetch("http://localhost:8080/getMessages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: firstUserID, receiver: secondUserID }),
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        return data.success ? data.messages : [];
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}


function showNotification(message) {
    const contacts = document.getElementsByClassName("contact");

    const contactID = message.Sender.id;
    console.log(contactID, message.Sender)
    
    for (let contact of contacts) {
        if (contact.dataset.id === contactID.toString()) {
            const notificationDot = contact.querySelector(".notification-dot");
            if (notificationDot) {
                notificationDot.style.display = "inline-block"; // Show the dot
            }
            break;
        }
    }
}

