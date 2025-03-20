import {openPrivateMessage, unreadMessages, hideContactNotification, updateSidebarNotification} from "./message.js";
import { getCurrentUser } from "./user.js";

export let contactsList = await getContacts(); // Store contacts globally

 async function getContacts(){
    return await fetch("/api/contacts")
       .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
       })
       .then(data => {
            //console.log("Received data:", data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}

export async function showContacts() {
    try {
        contactsList = await getContacts(); // Store contacts for updating later
        renderContacts();
    } catch (error) {
        console.error("Failed to load contacts:", error);
    }
}

export function renderContacts() {
    let container = document.getElementById("contacts-container");
    
    if (!container) {
        container = document.createElement("div");
        container.id = "contacts-container";
        document.body.appendChild(container);
    }

    container.innerHTML = ""; // Clear old contacts

    contactsList.forEach(contact => {
        const contactDiv = document.createElement("div");
        contactDiv.className = "contact";
        //console.log(contact.ID, contact);
        contactDiv.dataset.id = contact.ID;

        contactDiv.addEventListener("click", () => {
            if (document.querySelector(`.text-container`)) {
                document.querySelector(`.text-container`).remove();
            }

            // Mark message as read
            hideContactNotification(contact.ID);
            updateSidebarNotification()
            let user = getCurrentUser();
            openPrivateMessage(user, contact);
        });

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        avatarDiv.textContent = contact.Username[0].toUpperCase();

        const nameContainer = document.createElement("div");
        nameContainer.className = "name-container";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = contact.Username;

        // Notification dot for this contact
        const notificationDot = document.createElement("span");
        notificationDot.className = "notification-dot";
        notificationDot.style.display = unreadMessages[contact.ID] ? "inline-block" : "none";

        nameContainer.appendChild(nameSpan);
        nameContainer.appendChild(notificationDot);

        contactDiv.appendChild(avatarDiv);
        contactDiv.appendChild(nameContainer);
        container.appendChild(contactDiv);
    });

    // Update sidebar notification dot
    updateSidebarNotification();
}
