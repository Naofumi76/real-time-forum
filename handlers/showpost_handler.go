package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time/db"
	"strconv"
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


func GetPostByIdHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, `{"success": false, "message": "Invalid request method"}`, http.StatusMethodNotAllowed)
        return
    }

    // Extract ParentID from query parameters
    parentID := r.URL.Query().Get("ParentID")
    if parentID == "" {
        http.Error(w, `{"success": false, "message": "Missing ParentID parameter"}`, http.StatusBadRequest)
        return
    }

	id, err := strconv.Atoi(parentID)
	if err != nil {
        http.Error(w, `{"success": false, "message": "Invalid ParentID format"}`, http.StatusBadRequest)
        return
    }


    // Fetch the post from the database
    post, err := db.SelectPostByID(id)
    if err != nil {
        http.Error(w, `{"success": false, "message": "Error fetching post"}`, http.StatusInternalServerError)
        return
    }

    // Return the post as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(post)
}