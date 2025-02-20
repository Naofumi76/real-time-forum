package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
	"time"
)

type CreatePostRequest struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	Picture  string `json:"picture"`
	SenderID int    `json:"sender_id"`
	ParentID *int   `json:"parent_id"`
}

type CreatePostResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(CreatePostResponse{Success: false, Message: "Invalid request method"})
		return
	}

	// Decode JSON request
	var req CreatePostRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	db.CreatePost(req.SenderID, req.Title, req.Content, req.Picture, time.Now().Format("2006-01-02 15:04:05"), req.ParentID)

	// Create a success response
	response := CreatePostResponse{
		Success: true,
		Message: "Post successfully created",
	}

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode and send the response
	json.NewEncoder(w).Encode(response)
}
