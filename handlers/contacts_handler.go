package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time/db"
)

type ContactsRequest struct {
	CurrentUserID int `json:"current_user_id"`
}

func ContactsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ContactsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Fetch contacts sorted with conversation partners first
	contacts, err := db.FetchAllUsers(req.CurrentUserID)
	if err != nil {
		log.Printf("Error fetching sorted contacts: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}
