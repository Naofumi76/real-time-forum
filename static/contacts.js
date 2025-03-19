import {openPrivateMessage, unreadMessages} from "./message.js";
import { getCurrentUser } from "./user.js";




 async function getContacts(){
    return await fetch("/api/contacts")
       .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
       })
       .then(data => {
            console.log("Received data:", data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}


export async function showContacts() {
    try {
        const contacts = await getContacts();
        const container = document.createElement("div");
        container.id = "contacts-container";

        contacts.forEach(contact => {
            const contactDiv = document.createElement("div");
            contactDiv.className = "contact";

            contactDiv.dataset.id = contact.ID;

            contactDiv.addEventListener("click", () => {
                if(document.querySelector(`.text-container`)){
                    document.querySelector(`.text-container`).remove();
                }
                // Clear unread messages when opening chat
                delete unreadMessages[contact.ID];

                        // Remove notification dot when chat is opened
                const notificationDot = contactDiv.querySelector(".notification-dot");
                if (notificationDot) {
                    notificationDot.style.display = "none";
                }

                openPrivateMessage(getCurrentUser(), contact);

            });

            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar";
            avatarDiv.textContent = contact.Username[0].toUpperCase();

            const nameSpan = document.createElement("span");
            nameSpan.textContent = contact.Username;

            const notificationDot = document.createElement("span"); // Notification dot
            notificationDot.className = "notification-dot";
            notificationDot.style.display = "none"; // Initially hidden

            contactDiv.appendChild(avatarDiv);
            contactDiv.appendChild(nameSpan);
            contactDiv.appendChild(notificationDot);
            container.appendChild(contactDiv);
        });

        document.body.appendChild(container);
    } catch (error) {
        console.error("Failed to load contacts:", error);
    }
}

