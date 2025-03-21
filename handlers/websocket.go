package handlers

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"real-time/db"
	"strconv"
    "encoding/json"


	"github.com/gorilla/websocket"
)

var clients = make(map[string]*websocket.Conn) // Maps username to WebSocket connection
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var mutex = &sync.Mutex{}

type UserIDWb struct {
    ID       int    `json:"id"`
	Username string `json:"Username"`
}

type Message struct {
	Sender   UserIDWb   `json:"Sender"`
    Receiver UserIDWb   `json:"Receiver"`
	Content  string `json:"Content"`
	Date     string `json:"date"`
}

// Handles WebSocket connections
func HandleConnections(w http.ResponseWriter, r *http.Request) {
    user := r.URL.Query().Get("user")
    if user == "" {
        http.Error(w, "Missing username", http.StatusBadRequest)
        return
    }

    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WebSocket Upgrade Error:", err)
        return
    }
    defer ws.Close()

    mutex.Lock()
    clients[user] = ws
    mutex.Unlock()
    fmt.Printf("User %s connected\n", user)
	
    for {
		var msg Message
        err := ws.ReadJSON(&msg)
		fmt.Println("Conenciton no jutsu : ", msg.Sender, msg.Receiver,)
        if err != nil {
            log.Printf("Read error from %s: %v", user, err)
            
            // Check if the error is due to a client disconnect
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                fmt.Printf("User %s disconnected unexpectedly\n", user)
            }

            // Remove the user from the active clients map
            mutex.Lock()
            delete(clients, user)
            mutex.Unlock()
            break
        }


        // Save message to the database
        db.CreateMessage(msg.Sender.ID, msg.Receiver.ID, msg.Content, msg.Date)

        // Send the message to the recipient only
        mutex.Lock()
        receiverWS, exists := clients[strconv.Itoa(msg.Receiver.ID)]
        mutex.Unlock()

        if exists {
            err := receiverWS.WriteJSON(msg)
            if err != nil {
                log.Printf("Error sending message to %s: %v", msg.Receiver.ID, err)
            }
        }
    }
}

func GetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	var onlineUsers []string
	for userID := range clients {
		onlineUsers = append(onlineUsers, userID)
	}

    //fmt.Println("Online users: ", onlineUsers)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

    response, err := json.Marshal(map[string]interface{}{
		"online_users": onlineUsers,
	})
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		return
	}

	w.Write(response)
}