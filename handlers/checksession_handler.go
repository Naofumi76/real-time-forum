package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time/db"
)

func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		fmt.Println("No session cookie found:", err)
		json.NewEncoder(w).Encode(LoginResponse{Success: false, Message: "No active session"})
		return
	}

	fmt.Println("Session cookie received:", cookie.Value)

	user := db.GetUserFromCookie(w, r)
	if user == nil {
		fmt.Println("No user found for session")
		json.NewEncoder(w).Encode(LoginResponse{Success: false, Message: "No active session"})
		return
	}

	fmt.Println("User found:", user.Username)
	json.NewEncoder(w).Encode(LoginResponse{Success: true, Message: "Session active", Username: user.Username})
}
