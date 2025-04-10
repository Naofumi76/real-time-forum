import { contactsList, renderContacts } from "./contacts.js";
import { socket } from "./sideBar.js";
import { showPopup } from "./utils.js";

export let activeSockets = {}; // Store active WebSocket connections per user
let activeChatUser = null;
export let unreadMessages = {};
let offSet = 0 ;

function throttle(func, delay) {
    let lastCall = 0;
    let timeout;
    return function (...args) {
        const now = Date.now();
        const context = this;

        if (now - lastCall > delay) {
            lastCall = now;
            func.apply(context, args);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                lastCall = Date.now();
                func.apply(context, args);
            }, delay);
        }
    };
}


export async function openPrivateMessage(firstUser, secondUser) {
    //console.log("Opening chat between:", firstUser, secondUser);
    //console.log("Active user:", activeSockets)

    offSet = 0;
    activeChatUser = secondUser;
  if (unreadMessages.hasOwnProperty(secondUser.ID)) {
        delete unreadMessages[secondUser.ID];
        hideContactNotification(secondUser.ID);
        updateSidebarNotification() // Hide notification dot
    } else {
        console.warn("Unread messages entry not found for:", secondUser.ID);
    }

    // Ensure WebSocket is connected

    if (document.querySelector('.message-container')){
        //console.log('Removed')
        document.querySelector('.message-container').remove();
    }

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

    //console.log("user are : ", firstUser, secondUser);

    let messages = await getMessages(firstUser.ID, secondUser.ID, offSet) || [];
    offSet += messages.length
    messages.reverse();
    messages.forEach(message => displayMessage(message, firstUser, secondUser));

    messageContainer.appendChild(textContainer);

	async function scroll() {
		if (textContainer.scrollTop === 0) {
			//console.log("Fetching more messages...");
			
			let olderMessages = await getMessages(firstUser.ID, secondUser.ID, offSet) || [];
			if (olderMessages.length > 0) {
				offSet += olderMessages.length;
	
				let previousHeight = textContainer.scrollHeight; // Save current scroll height before adding messages
	
				olderMessages.forEach(message => {
					displayMessageAtTop(message, firstUser, secondUser);
				});
	
				// Maintain scroll position after loading messages
				textContainer.scrollTop = textContainer.scrollHeight - previousHeight;
			}
		}
	}

	textContainer.addEventListener("scroll", throttle(scroll, 300));

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
    let typingTimeout;

    sendMessageInput.addEventListener("input", function () {
        socket.send(JSON.stringify({
            type: "typing",
            sender: { ID: firstUser.ID, Username: firstUser.username },
            receiver: { ID: secondUser.ID, Username: secondUser.Username },
        }));
    
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.send(JSON.stringify({
                type: "stopTyping",
                sender: { ID: firstUser.ID },
                receiver: { ID: secondUser.ID },
            }));
        }, 2000); // Stop typing after 2s of no input
    });

    // Handle sending message on button click
    sendMessageButton.addEventListener("click", function () {
        sendMessage(socket, firstUser, secondUser, sendMessageInput.value);
        sendMessageInput.value = "";
    });

    let typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.textContent = `${secondUser.Username} is typing...`;
    typingIndicator.style.display = "none";
    messageContainer.appendChild(typingIndicator);

    messageContainer.appendChild(sendMessageInput);
    messageContainer.appendChild(sendMessageButton);



    document.body.appendChild(messageContainer);
}


function showTypingIndicator(user) {
    const indicator = document.querySelector(".typing-indicator");
    if (activeChatUser && user.ID == activeChatUser.ID) {
        indicator.style.display = "block";
    }
}

function hideTypingIndicator(user) {
    const indicator = document.querySelector(".typing-indicator");
    if (activeChatUser && user.ID == activeChatUser.ID) {
        indicator.style.display = "none";
    }
}

// WebSocket Connection (Reused if Already Connected)
export function connectWebSocket(user) {
    //console.log(user);
    if (activeSockets[user.ID]) {
        return activeSockets[user.ID]; // Reuse existing connection
    }

    const socket = new WebSocket(`ws://localhost:8080/ws?user=${user.ID}`);

    socket.onopen = function () {
        //console.log(`Connected to WebSocket as ${user.username}`);
    };

    socket.onmessage = function (event) {

        const data = JSON.parse(event.data);

        if (data.type === "online_users_update"){
            updateOnlineStatus(data.online_users)
            return;
        }

        if (data.type === "typing") {
            showTypingIndicator(data.sender);
            return;
        }
    
        if (data.type === "stopTyping") {
            hideTypingIndicator(data.sender);
            return;
        }

        const message = JSON.parse(event.data);
        //console.log("📩 New private message received:", message, activeChatUser, message.Sender.Username);
    
        if (activeChatUser && activeChatUser.Username === message.Sender.Username) {
            // If chat is open, display the message in the chat
            displayMessage(message, user, message.Sender);
        } else {
            //console.log(data)
            // If chat is NOT open, show a notification
            showNotification(message);
        }

    };

    socket.onclose = function () {
        //console.log("WebSocket Disconnected!");
        delete activeSockets[user.ID]; // Remove from active connections
    };

    activeSockets[user.ID] = socket;
    return socket;
}

//  Send Message via WebSocket
export async function sendMessage(socket, sender, receiver, messageContent) {
    if (!messageContent.trim()) return showPopup("Message cannot be empty!");

	//console.log("sendMessage", sender, receiver, messageContent)

    const message = {
        Sender: { ID: sender.ID, Username: sender.username },          // Sender as an object with ID
        Receiver: { ID: receiver.ID, Username: receiver.Username},
        Content: messageContent,		
        date: new Date().toISOString(),
    };

    showNotificationMAJ(message);

    socket.send(JSON.stringify(message)); // Send message to server
	displayMessage(message, sender, receiver);
}

//  Display Message in Chat Window
function displayMessage(message, firstUser, secondUser) {

    let textContainer = document.querySelector(`.text-container`);

    if (!textContainer) {
        //console.warn("⚠️ Text container not found! Retrying in 500ms...");
        setTimeout(() => displayMessage(message, firstUser, secondUser), 500);
        return;
    }

    let finalMessage = document.createElement("div");
    let messageContent = document.createElement("p");
    let messageSender = document.createElement("p");


    let date = null;
    if(message.Date){
        date = new Date(message.Date);
    }else {
        date = new Date(message.date);
    }

    const formattedDate = date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Set to true for 12-hour format
    timeZone: 'UTC' // Adjust according to your desired timezone
    });


    // Ensure the message content is not empty
    messageContent.textContent = message.Content || "(No content)";
    messageSender.textContent = message.Sender.ID === firstUser.ID ? firstUser.username +" at "+ formattedDate : (secondUser ? secondUser.Username : message.Sender.Username) + " at "+formattedDate;
    
    // Assign classes for styling
    finalMessage.classList.add(
        message.Sender.ID === firstUser.ID ? "message-sender-you" : "message-sender-other"
    );
    
    // Append elements properly
    finalMessage.appendChild(messageSender);
    finalMessage.appendChild(messageContent);
    textContainer.appendChild(finalMessage);

    // Auto-scroll to latest message
    textContainer.scrollTop = textContainer.scrollHeight;
}

function displayMessageAtTop(message, firstUser, secondUser) {
    let textContainer = document.querySelector(`.text-container`);

    if (!textContainer) return;

    let finalMessage = document.createElement("div");
    let messageContent = document.createElement("p");
    let messageSender = document.createElement("p");

    const date = new Date(message.Date);
    const formattedDate = date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    });

    messageContent.textContent = message.Content || "(No content)";
    messageSender.textContent = message.Sender.ID === firstUser.ID 
        ? firstUser.username + " at " + formattedDate 
        : (secondUser ? secondUser.Username : message.Sender.Username) + " at " + formattedDate;

    finalMessage.classList.add(
        message.Sender.ID === firstUser.ID ? "message-sender-you" : "message-sender-other"
    );

    finalMessage.appendChild(messageSender);
    finalMessage.appendChild(messageContent);

    textContainer.prepend(finalMessage); // Add messages at the top
}


// Fetch Past Messages from Server
export async function getMessages(firstUserID, secondUserID, offSet) {

    try {
        const response = await fetch("http://localhost:8080/getMessages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: firstUserID, receiver: secondUserID, offSet: offSet}),
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
    // Find the contact in the list

    const contactID = message.Sender.id;

    const contactIndex = contactsList.findIndex(contact => contact.ID === contactID);

    if (contactIndex !== -1) {
        const [contact] = contactsList.splice(contactIndex, 1);
        contactsList.unshift(contact);
        if(document.getElementById("contacts-container")){
            renderContacts(); // Re-render to move it up
        }
        
        setTimeout(() => {
            // Show notification dot on the contact
            const contactDot = document.querySelector(`.contact[data-id='${contactID}'] .notification-dot`);
            if (contactDot) {
                contactDot.style.display = "inline-block";
            }
            
            // Mark contact as having unread messages
            unreadMessages[contactID] = true;
            
            // Update sidebar notification dot
            updateSidebarNotification();
        }, 0);
    }
}

function showNotificationMAJ(message) {
    // Find the contact in the list

    const contactID = message.Receiver.ID;

    const contactIndex = contactsList.findIndex(contact => contact.ID === contactID);
    
    if (contactIndex !== -1) {
        // Move the contact to the top
        const [contact] = contactsList.splice(contactIndex, 1);
        contactsList.unshift(contact);
        if(document.getElementById("contacts-container")){
            renderContacts(); // Re-render to move it up
        }

    }
}


// Hide red dot when a message is read
export function hideContactNotification(contactID) {
    // Remove unread status for this contact
    //delete unreadMessages[contactID];

    // Hide notification dot for this contact
    const contactDot = document.querySelector(`.contact[data-id='${contactID}'] .notification-dot`);
    if (contactDot) {
        contactDot.style.display = "none";
    }

    // Update sidebar notification dot
    updateSidebarNotification();
}

export function updateSidebarNotification() {
    const sidebarDot = document.querySelector("#contacts .notification-dot");


    // Check if there are any unread messages left
    const hasUnreadMessages = Object.keys(unreadMessages).length > 0;

    if (hasUnreadMessages) {
        sidebarDot.style.display = "inline-block";
        sidebarDot.style.visibility = "visible";
        sidebarDot.style.opacity = 1;
    } else {
        sidebarDot.style.display = "none";
        sidebarDot.style.visibility = "hidden";
        sidebarDot.style.opacity = 0;
    }
}

export async function fetchOnlineUsers() {
    try {
        const response = await fetch("http://localhost:8080/online-users");
        const data = await response.json();
        //console.log("Online users:", data.online_users);
        updateOnlineStatus(data.online_users);
    } catch (error) {
        console.error("Error fetching online users:", error);
    }
}

function updateOnlineStatus(onlineUsers) {


    document.querySelectorAll(".contact").forEach(contactDiv => {
        const contactID = contactDiv.dataset.id;
        let onlineDot = contactDiv.querySelector(".online-dot");


        if (!onlineDot) {
            onlineDot = document.createElement("span");
            onlineDot.className = "online-dot";
            contactDiv.appendChild(onlineDot);
        }

        if (onlineUsers.includes(contactID)) {
            onlineDot.style.display = "inline-block"; // Show green dot
        } else {
            onlineDot.style.display = "none"; // Hide green dot if offline
        }
    });
}
// Call this function periodically or on demand
//setInterval(fetchOnlineUsers, 5000); // Fetch every 5 seconds