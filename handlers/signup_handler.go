package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"real-time/db"
)

type SignupRequest struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Password  string `json:"password"`
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
		return
	}

	var req SignupRequest
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Error reading request body"}`, http.StatusInternalServerError)
		return
	}

	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(w, `{"success": false, "message": "Invalid JSON input"}`, http.StatusBadRequest)
		return
	}

	user, err := db.CreateUser(req.Username, req.Email, req.Age, req.Gender, req.FirstName, req.LastName, req.Password)
	if err != nil {
		// Handle specific errors and return a JSON response
		response := map[string]interface{}{
			"success": false,
			"message": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// If successful, return the created user
	response := map[string]interface{}{
		"success": true,
		"message": "User registered successfully",
		"user": map[string]interface{}{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"age":        user.Age,
			"gender":     user.Gender,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	}

	// Set response headers and return success message
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
