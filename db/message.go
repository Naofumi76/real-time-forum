package db

import (
	"database/sql"
	"log"
)

func CreateMessage(sender, receiver int, content, date string) {
	db := GetDB()
	defer db.Close()

	query := "INSERT INTO messages (sender, receiver, content, date) VALUES (?,?,?,?)"
	_, err := db.Exec(query, sender, receiver, content, date)
	if err != nil {
		log.Printf("Error creating message: %v", err)
	}
}

func FetchMessages(sender, receiver, offset int) []Message {
	db := GetDB()
	defer db.Close()

	limit := 10

	query := `
        SELECT * FROM messages 
        WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?`
	
	rows, err := db.Query(query, sender, receiver, receiver, sender, limit, offset)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		log.Printf("Error executing query: %v", err)
		return []Message{}
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var message Message
		err = rows.Scan(&message.ID, &message.Sender.ID, &message.Receiver.ID, &message.Content, &message.Date)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		messages = append(messages, message)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating rows: %v", err)
		return []Message{}
	}


	return messages
}

func ConversationExists(sender, receiver int) bool {
	db := GetDB()
	defer db.Close()

	var exists bool
	err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM conversations WHERE (sender =? AND receiver =?) OR (sender =? AND receiver =?))", sender, receiver, receiver, sender).Scan(&exists)
	if err != nil {
		log.Printf("Error checking conversation existence: %v", err)
		return false
	}
	return exists
}
