import {openPrivateMessage} from "./message.js";
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

            contactDiv.addEventListener("click", () => {
                openPrivateMessage(getCurrentUser(), contact);
            });


            contactDiv.className = "contact";

            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar";
            console.log(contact);
            avatarDiv.textContent = contact.Username[0].toUpperCase(); // First letter in uppercase

            const nameSpan = document.createElement("span");
            nameSpan.textContent = contact.Username;

            contactDiv.appendChild(avatarDiv);
            contactDiv.appendChild(nameSpan);

            container.appendChild(contactDiv);
        });

        document.body.appendChild(container);
    } catch (error) {
        console.error("Failed to load contacts:", error);
    }
}
