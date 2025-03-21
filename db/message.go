package db

import (
	"database/sql"
	"log"
)

func CreateMessage(sender, receiver int, content, date string) {
	db := GetDB()
	defer db.Close()

	// First get or create the conversation
	conversationID, err := UpdateConversation(sender, receiver)
	if err != nil {
		log.Printf("Error with conversation: %v", err)
		return
	}

	// Now insert the message with the conversation ID
	query := "INSERT INTO messages (sender, receiver, content, date, conversation_id) VALUES (?, ?, ?, ?, ?)"
	_, err = db.Exec(query, sender, receiver, content, date, conversationID)
	if err != nil {
		log.Printf("Error creating message: %v", err)
	} else {
		log.Printf("Message created: sender=%d, receiver=%d, conversation=%d", sender, receiver, conversationID)
	}
}

func FetchMessages(sender, receiver, offset int) []Message {
	db := GetDB()
	defer db.Close()

	limit := 10

	query := `
        SELECT id, sender, receiver, content, date FROM messages 
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
	err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))",
		sender, receiver, receiver, sender).Scan(&exists)
	if err != nil {
		log.Printf("Error checking conversation existence: %v", err)
		return false
	}
	return exists
}

func UpdateConversation(sender, receiver int) (int, error) {
	db := GetDB()
	defer db.Close()

	var conversationID int
	existsQuery := `SELECT id FROM conversations 
                    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`
	err := db.QueryRow(existsQuery, sender, receiver, receiver, sender).Scan(&conversationID)

	if err != nil {
		if err == sql.ErrNoRows {
			tx, err := db.Begin()
			if err != nil {
				log.Printf("Error beginning transaction: %v", err)
				return 0, err
			}

			createQuery := "INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)"
			result, err := tx.Exec(createQuery, sender, receiver)
			if err != nil {
				tx.Rollback()
				log.Printf("Error creating conversation: %v", err)
				return 0, err
			}

			if err := tx.Commit(); err != nil {
				log.Printf("Error committing transaction: %v", err)
				return 0, err
			}

			lastID, err := result.LastInsertId()
			if err != nil {
				log.Printf("Error getting last insert ID: %v", err)
				return 0, err
			}

			return int(lastID), nil
		}

		return 0, err
	}

	updateQuery := "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?"
	_, err = db.Exec(updateQuery, conversationID)
	if err != nil {
		log.Printf("Error updating conversation timestamp: %v", err)
		return 0, err
	}

	return conversationID, nil
}
