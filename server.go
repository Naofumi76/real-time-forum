package main

import (
	"fmt"
	"log"
	"net/http"
	"real-time/handlers"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	// Register handlers
	http.HandleFunc("/signup", handlers.SignupHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/api/posts", handlers.ShowPostHandler)
	http.HandleFunc("/api/comments", handlers.ShowCommentHandler)
	http.HandleFunc("/create-post", handlers.CreatePostHandler)
	http.HandleFunc("/getMessages", handlers.GetMessagesHandler)
	http.HandleFunc("/sendMessage", handlers.SendMessageHandler)
	http.HandleFunc("/get-user-session", handlers.GetUserSessionHandler)
	http.HandleFunc("/api/postID", handlers.GetPostByIdHandler)
	http.HandleFunc("/api/contacts", handlers.ContactsHandler)
	http.HandleFunc("/ws", handlers.HandleConnections)
	http.HandleFunc("/online-users", handlers.GetOnlineUsers)

	port := ":8080"
	fmt.Println("Server started at http://localhost" + port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error starting server:", err)
	}
}
