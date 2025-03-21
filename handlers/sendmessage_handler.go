package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
)

type SendMessageRequest struct {
	Message  string `json:"message"`
	Sender   int    `json:"sender"`
	Receiver int    `json:"receiver"`
	Date     string `json:"date"`
}

type SendMessageResponse struct {
	Success bool   `json:"success"`
	Reponse string `json:"message"`
}

func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request
	var req SendMessageRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	// Fetch message
	db.CreateMessage(req.Sender, req.Receiver, req.Message, req.Date)
	db.UpdateConversation(req.Sender, req.Receiver)

	// Create response
	response := SendMessageResponse{
		Success: true,
	}

	// Set response header to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode and send the response
	json.NewEncoder(w).Encode(response)
}
