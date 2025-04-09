import * as post from './post.js';
import { showContacts, hideContact } from './contacts.js';
import { homePage } from './home.js';
import { connectWebSocket } from './message.js';
import { getCurrentUser } from './user.js';
import { disconnectUser, getUserFromSession } from './session.js';
import { createIndexButton, indexListener } from './registerPage.js';

export let socket = null;


export let contactOpen = false;
export async function displaySideBar() {

    const currentUser = await getCurrentUser(); // This will return the current user object

    // Connect to WebSocket for the current user
    socket = connectWebSocket(currentUser);

    const bar = document.createElement('nav');
    bar.innerHTML = `
        <ul>
            <li id="home">
                    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill="currentColor"></path> </g></svg>
                    <span>Home</span>
            </li>
            <li id="contacts">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    <span>Contatcs</span>
            </li>
            <li id="createPost">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 11H15M12 8V14M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20Z" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                <span>Create Post</span>
            </li>
            <li id="logout">
                <svg fill="currentColor" viewBox="-2 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M7.498 17.1a7.128 7.128 0 0 1-.98-.068 7.455 7.455 0 0 1-1.795-.483 7.26 7.26 0 0 1-3.028-2.332A7.188 7.188 0 0 1 .73 12.52a7.304 7.304 0 0 1 .972-7.128 7.221 7.221 0 0 1 1.387-1.385 1.03 1.03 0 0 1 1.247 1.638 5.176 5.176 0 0 0-.993.989 5.313 5.313 0 0 0-.678 1.181 5.23 5.23 0 0 0-.348 1.292 5.22 5.22 0 0 0 .326 2.653 5.139 5.139 0 0 0 .69 1.212 5.205 5.205 0 0 0 .992.996 5.257 5.257 0 0 0 1.178.677 5.37 5.37 0 0 0 1.297.35 5.075 5.075 0 0 0 1.332.008 5.406 5.406 0 0 0 1.32-.343 5.289 5.289 0 0 0 2.211-1.682 5.18 5.18 0 0 0 1.02-2.465 5.2 5.2 0 0 0 .01-1.336 5.315 5.315 0 0 0-.343-1.318 5.195 5.195 0 0 0-.695-1.222 5.134 5.134 0 0 0-.987-.989 1.03 1.03 0 1 1 1.24-1.643 7.186 7.186 0 0 1 1.384 1.386 7.259 7.259 0 0 1 .97 1.706 7.413 7.413 0 0 1 .473 1.827 7.296 7.296 0 0 1-4.522 7.65 7.476 7.476 0 0 1-1.825.471 7.203 7.203 0 0 1-.89.056zM7.5 9.613a1.03 1.03 0 0 1-1.03-1.029V2.522a1.03 1.03 0 0 1 2.06 0v6.062a1.03 1.03 0 0 1-1.03 1.03z"></path></g></svg>    
                <span>Log out</span>
            </li>
        </ul>
    `;
    bar.id = 'sidebar';
    document.body.appendChild(bar);

    const contacts = document.getElementById('contacts');
    contacts.addEventListener('click', () => {
        if(contactOpen){
            contactOpen = false;
            hideContact();
        } else {
            contactOpen = true;
            showContacts()
        }
    });

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
            await disconnectUser();
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

    await showContacts()
    hideContact()   
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
