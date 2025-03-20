import * as post from './post.js';
import { showContacts } from './contacts.js';
import { homePage } from './home.js';
import { connectWebSocket } from './message.js';
import { getCurrentUser } from './user.js';
import { disconnectUser, getUserFromSession } from './session.js';
import { createIndexButton, indexListener } from './registerPage.js';

export async function displaySideBar() {

    const currentUser = await getCurrentUser(); // This will return the current user object

    // Connect to WebSocket for the current user
    const socket = connectWebSocket(currentUser);

    const bar = document.createElement('nav');
    bar.innerHTML = `
        <ul>
            <li id="home">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                    <span>Menu</span>
            </li>
            <li id="contacts">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    <span>Contatcs</span>
            </li>
            <li id="logout">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span>Log out</span>
            </li>
            <li id="createPost">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clip-rule="evenodd" /></svg>
                    <span>Create Post</span>
            </li>
        </ul>
    `;
    bar.id = 'sidebar';
    document.body.appendChild(bar);

    const contacts = document.getElementById('contacts');
    contacts.addEventListener('click', showContacts);

    const notificationDotc = document.createElement("span");
    notificationDotc.className = "notification-dot";
    notificationDotc.style.display = "none"; // Initially hidden
    contacts.appendChild(notificationDotc);

    const createpost = document.getElementById('createPost');
    createpost.addEventListener('click', post.createPost);

    const home = document.getElementById('home');
    home.addEventListener('click', () => {
        document.getElementById('postContainer').innerHTML = "";
        homePage();
    });

    // Add logout functionality
    const logout = document.getElementById('logout');
    logout.addEventListener('click', async () => {
        try {
            console.log("Logout button clicked");
            await disconnectUser();
            console.log("Logout successful, clearing UI");
            // Close WebSocket connection if open
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
			}
			document.body.innerHTML = "";
			createIndexButton()
			indexListener()
        } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred during logout: " + error.message);
        }
    });

    const notificationDot = document.createElement("span"); // Notification dot
    notificationDot.className = "notification-dot";
    notificationDot.style.display = "none"; // Initially hidden

    contacts.appendChild(notificationDot);

}

function updateSidebarNotification() {
    const sidebarDot = document.querySelector("#contacts .notification-dot");

    // Show dot if any contact has unread messages
    const hasUnreadMessages = Object.values(unreadMessages).some(status => status);

    if (hasUnreadMessages) {
        sidebarDot.style.display = "inline-block";
    } else {
        sidebarDot.style.display = "none";
    }
}

function hideContactNotification(contactID) {
    // Remove unread status for this contact
    delete unreadMessages[contactID];

    // Hide dot from this specific contact
    const contactDot = document.querySelector(`.contact[data-id='${contactID}'] .notification-dot`);
    if (contactDot) {
        contactDot.style.display = "none";
    }

    // Update sidebar notification based on remaining unread messages
    updateSidebarNotification();
}
