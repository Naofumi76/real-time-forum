package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
)

// UserLoginRequest represents the JSON request structure for login
type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents the JSON response structure for login
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// LoginHandler handles user authentication
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req UserLoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON input", http.StatusBadRequest)
		return
	}

	user, err := db.SelectUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if !db.IsPasswordValid(req.Password, user.Password) {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Create a success response
	response := LoginResponse{
		Success: true,
		Message: "Login successful",
	}

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")

	// Encode and send the response
	json.NewEncoder(w).Encode(response)
}
