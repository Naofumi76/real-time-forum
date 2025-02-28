package handlers

import (
	"encoding/json"
	"net/http"
	"real-time/db"
	"strings"
)

// UserLoginRequest represents the JSON request structure for login
type UserLoginRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse represents the JSON response structure for login
type LoginResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// LoginHandler handles user authentication
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request
	var req UserLoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	// Ensure at least one field (email or username) is provided
	if req.Email == "" && req.Username == "" {
		http.Error(w, `{"success": false, "message": "Email or Username required"}`, http.StatusBadRequest)
		return
	}

	// Find user by email first, then by username if email is empty
	var user *db.User
	if strings.Contains(req.Username, "@") {
		user, err = db.SelectUserByEmail(req.Username)
	} else {
		user, err = db.SelectUserByUsername(req.Username)
	}

	// Check if user exists
	if user == nil || err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{Success: false, Message: "User not found"})
		return
	}

	// Validate password
	if !db.IsPasswordValid(req.Password, user.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{Success: false, Message: "Invalid password"})
		return
	}

	// Create a success response
	response := LoginResponse{
		Success: true,
		Message: "Login successful",
	}

	db.SetSession(w, user.Username)

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode and send the response
	json.NewEncoder(w).Encode(response)
}
