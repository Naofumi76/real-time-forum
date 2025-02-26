package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func GetDB() *sql.DB {
	db, err := sql.Open("sqlite3", "db/database.db")
	if err != nil {
		log.Fatal(err)
	}

	// SQL statement to create the users table
	tables := `CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE,
			email TEXT UNIQUE,
			age INTEGER NOT NULL,
			gender TEXT NOT NULL,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			password TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);  CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender INTEGER NOT NULL,
			parent_id INTEGER DEFAULT NULL,
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			picture LONGTEXT,
			date TEXT NOT NULL,
			FOREIGN KEY (sender) REFERENCES users(id)
			FOREIGN KEY (parent_id) REFERENCES posts(id)
		); CREATE TABLE IF NOT EXISTS sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			connected_user INTEGER NOT NULL,
			uuid STRING NOT NULL,
			FOREIGN KEY (connected_user) REFERENCES users(id)
		); CREATE TABLE IF NOT EXISTS messages (
		    id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender INTEGER NOT NULL,
            receiver INTEGER NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (sender) REFERENCES users(id),
            FOREIGN KEY (receiver) REFERENCES users(id)	
		)`

	// Start a transaction
	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statements within the transaction
	_, err = tx.Exec(tables)
	if err != nil {
		// If there's an error, roll back the transaction
		tx.Rollback()
		log.Fatal(err)
	}

	// If everything is okay, commit the transaction
	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
	}

	return db
}
