package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"real-time/db"
)

type Post struct {
	ID       int    `json:"id"`
	Sender   int    `json:"sender"`
	Username string `json:"username"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Picture  string `json:"picture"`
	Date     string `json:"date"`
}

func ShowPostHandler(w http.ResponseWriter, r *http.Request) {

	posts := db.FetchPosts()

	fmt.Println(posts)

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(posts)
	if err != nil {
		log.Printf("Error encoding JSON: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully returned %d posts", len(posts))
}
