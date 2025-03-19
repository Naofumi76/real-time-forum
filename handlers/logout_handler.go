package handlers

import (
	"fmt"
	"net/http"
)

// LogoutResponse represents the JSON response structure for logout
type LogoutResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session_token",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, `{"success": true}`)
}
