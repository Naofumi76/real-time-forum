package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
	"time"
)

type CreatePostRequest struct {
	Title    string  `json:"title"`
	Content  string  `json:"content"`
	Picture  string  `json:"picture"`
	Sender   db.User `json:"sender"`
	ParentID *int    `json:"parent_id"`
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

	db.CreatePost(req.Sender.ID, req.Title, req.Content, req.Picture, time.Now().Format("2006-01-02 15:04:05"), req.ParentID)
}
