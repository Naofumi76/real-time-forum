package handlers

import (
	"encoding/json"
	"net/http"

	"real-time/db"
)

// SignupRequest represents the JSON request structure for signup
type SignupRequest struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Password  string `json:"password"`
}

// SignupResponse represents the JSON response structure for signup
type SignupResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// SignupHandler handles user registration
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request
	var req SignupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		http.Error(w, `{"success": false, "message": "Missing required fields"}`, http.StatusBadRequest)
		return
	}

	// Create user
	_, err = db.CreateUser(req.Username, req.Email, req.Age, req.Gender, req.FirstName, req.LastName, req.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: err.Error()})
		return
	}

	// Respond with success
	response := SignupResponse{
		Success: true,
		Message: "User registered successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
