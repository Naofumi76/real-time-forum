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
        var rawMsg map[string]interface{}
        err := ws.ReadJSON(&rawMsg)
        if err != nil {
            // Handle disconnect
            break
        }
    
        // If it's a typing event
        if rawMsg["type"] == "typing" || rawMsg["type"] == "stopTyping" {
            receiver := rawMsg["receiver"].(map[string]interface{})
            receiverID := int(receiver["ID"].(float64))
    
            mutex.Lock()
            receiverWS, exists := clients[strconv.Itoa(receiverID)]
            mutex.Unlock()
    
            if exists {
                receiverWS.WriteJSON(rawMsg) // Send typing status to receiver
            }
            continue
        }
    
        // Else treat it as a normal message
        var msg Message
        mapToStruct(rawMsg, &msg)
    
        // Save + forward message
        db.CreateMessage(msg.Sender.ID, msg.Receiver.ID, msg.Content, msg.Date)
    
        mutex.Lock()
        receiverWS, exists := clients[strconv.Itoa(msg.Receiver.ID)]
        mutex.Unlock()
    
        if exists {
            receiverWS.WriteJSON(msg)
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

func mapToStruct(data map[string]interface{}, msg *Message) {
	sender := data["Sender"].(map[string]interface{})
	receiver := data["Receiver"].(map[string]interface{})

	msg.Sender = UserIDWb{
		ID:       int(sender["ID"].(float64)),
		Username: sender["Username"].(string),
	}
	msg.Receiver = UserIDWb{
		ID:       int(receiver["ID"].(float64)),
		Username: receiver["Username"].(string),
	}
	msg.Content = data["Content"].(string)
	msg.Date = data["date"].(string)
}