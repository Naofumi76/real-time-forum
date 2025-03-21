import {openPrivateMessage, unreadMessages, hideContactNotification, updateSidebarNotification} from "./message.js";
import { getCurrentUser } from "./user.js";

export let contactsList = [];

async function getContacts() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error("No current user found - cannot fetch contacts");
        return [];
    }
    
    try {
        const response = await fetch("/api/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                current_user_id: currentUser.ID
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
}

export async function showContacts() {
    try {
        contactsList = await getContacts();
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
