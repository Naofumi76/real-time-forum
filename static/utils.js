/**
 * Shows a custom popup with the given message
 * @param {string} message - Message to display
 */
export function showPopup(message) {
    // Remove any existing popups first
    const existingPopup = document.querySelector('.custom-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup elements
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    
    const popupMessage = document.createElement('p');
    popupMessage.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.className = 'popup-close-btn';
    
    // Add click event to close popup
    closeButton.addEventListener('click', () => {
        popupOverlay.remove();
    });
    
    // Also close on overlay click
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.remove();
        }
    });
    
    // Assemble and add to DOM
    popup.appendChild(popupMessage);
    popup.appendChild(closeButton);
    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay);
    
    // Auto-focus the close button so Enter key works
    closeButton.focus();
}
