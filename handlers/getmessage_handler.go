package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
)

type GetMessageRequest struct {
	Sender   int `json:"sender"`
	Receiver int `json:"receiver"`
}

type GetMessageResponse struct {
	Success  bool         `json:"success"`
	Messages []db.Message `json:"messages"`
	Response string       `json:"response"`
}

func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "response": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request
	var req GetMessageRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"success": false, "response": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	// Fetch messages from DB
	messages := db.FetchMessages(req.Sender, req.Receiver)

	// Create response
	response := GetMessageResponse{
		Success:  true,
		Messages: messages,
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode and send response
	json.NewEncoder(w).Encode(response)
}
