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


export let contactsList = []; // Store contacts globally

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
        contactDiv.dataset.id = contact.ID;

        contactDiv.addEventListener("click", () => {
            if (document.querySelector(`.text-container`)) {
                document.querySelector(`.text-container`).remove();
            }
            delete unreadMessages[contact.ID]; // Clear unread messages
            openPrivateMessage(getCurrentUser(), contact);

            // Remove notification dot
            const notificationDot = contactDiv.querySelector(".notification-dot");
            if (notificationDot) {
                notificationDot.style.display = "none";
            }
        });

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        avatarDiv.textContent = contact.Username[0].toUpperCase();

        const nameContainer = document.createElement("div");
        nameContainer.className = "name-container";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = contact.Username;

        const notificationDot = document.createElement("span");
        notificationDot.className = "notification-dot";
        notificationDot.style.display = "none"; 

        nameContainer.appendChild(nameSpan);
        nameContainer.appendChild(notificationDot);

        contactDiv.appendChild(avatarDiv);
        contactDiv.appendChild(nameContainer);
        container.appendChild(contactDiv);
    });
}
