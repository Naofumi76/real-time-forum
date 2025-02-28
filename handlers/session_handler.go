package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time/db"
)

func GetUserSessionHandler(w http.ResponseWriter, r *http.Request) {
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

	json.NewEncoder(w).Encode(LoginResponse{Success: true, Message: "Session active", ID: user.ID, Username: user.Username, Email: user.Email, Age: user.Age, Gender: user.Gender, FirstName: user.FirstName, LastName: user.LastName})
}
