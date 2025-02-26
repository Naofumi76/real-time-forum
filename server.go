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
	http.HandleFunc("/api/posts", handlers.ShowPostHandler)
	http.HandleFunc("/create-post", handlers.CreatePostHandler)
	http.HandleFunc("/getMessages", handlers.GetMessagesHandler)
	http.HandleFunc("/sendMessage", handlers.SendMessageHandler)

	port := ":8080"
	fmt.Println("Server started at http://localhost" + port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error starting server:", err)
	}
}
