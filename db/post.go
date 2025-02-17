package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"sort"
	"time"
)

// CreatePost handles both posts and comments, depending on parentID
func CreatePost(sender int, categories []string, title, content, picture, date string, parentID *int) error {
	// Open the database connection
	db := GetDB()
	defer db.Close()

	// Start a database transaction
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	// Prepare the SQL statement for inserting a post (including parent_id)
	stmt, err := tx.Prepare("INSERT INTO posts (sender, parent_id, title, content, picture, date) VALUES(?, ?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	// If parentID is nil, it means it's an original post, so we set parent_id to 0
	if parentID == nil {
		_, err = stmt.Exec(sender, 0, title, content, picture, date)
	} else {
		// Otherwise, use the provided parent_id (for comments)
		_, err = stmt.Exec(sender, *parentID, title, content, picture, date)
	}

	if err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func FetchPosts() []Post {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.id, p.sender, p.parent_id, p.title, p.content, p.picture, p.date,
               IFNULL(u.username, 'Deleted User') AS username,
               IFNULL(u.email, '') AS email,
               IFNULL(u.picture, 'default-profile.png') AS picture
        FROM posts p
        LEFT JOIN users u ON p.sender = u.id
        ORDER BY p.id DESC;`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Sender.ID, &post.ParentID, &post.Title, &post.Content, &post.Picture, &post.Date, &post.Sender.Username, &post.Sender.Email, &post.Sender.Picture)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		post.NbComments, err = NbCommentsFromPost(post.ID)
		if err != nil {
			post.NbComments = 0
			fmt.Println("Error at fetching nb comments: ", err)
		}

		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return posts
}

func FetchComments() []Post {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.id, p.sender, p.parent_id, p.title, p.content, p.picture, p.date,
               IFNULL(u.username, 'Deleted User') AS username,
               IFNULL(u.email, '') AS email,
               IFNULL(u.picture, 'default-profile.png') AS picture
        FROM posts p
        JOIN categories c ON p.category = c.id
        LEFT JOIN users u ON p.sender = u.id
        ORDER BY p.id DESC;`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Sender.ID, &post.ParentID, &post.Title, &post.Content, &post.Picture, &post.Date, &post.Sender.Username, &post.Sender.Email, &post.Sender.Picture)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		post.NbComments, err = NbCommentsFromPost(post.ID)
		if err != nil {
			post.NbComments = 0
			fmt.Println("Error at fetching nb comments: ", err)
		}

		if post.ParentID != 0 {
			posts = append(posts, post)
		}
	}
	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return posts
}

func PostExist(id int) bool {
	db := GetDB()
	defer db.Close()
	var exist bool
	err := db.QueryRow("SELECT EXISTS( SELECT 1 FROM posts WHERE id = ?)", id).Scan(&exist)
	if err != nil {
		return false
	}
	return exist
}

func NbCommentsFromPost(id int) (int, error) {
	db := GetDB()
	defer db.Close()
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM posts WHERE parent_id =?", id).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func GetLastPostIDByUserID(id int) (int, error) {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT id
        FROM posts
		WHERE sender = ?
		ORDER BY id DESC
		LIMIT 1;`
	var postID int

	err := db.QueryRow(query, id).Scan(&postID)

	if err != nil {
		// Gérer l'erreur
		log.Printf("Erreur lors de l'exécution de la requête : %v", err)
		return 0, err
	}

	return postID, nil
}

func GetPostFromUserById(id int) []Post {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.id, p.sender, p.parent_id, p.title, p.content, p.picture, p.date,
               IFNULL(u.username, 'Deleted User') AS username,
               IFNULL(u.email, '') AS email,
               IFNULL(u.picture, 'default-profile.png') AS picture
		FROM posts p
        LEFT JOIN users u ON p.sender = u.id
		WHERE p.sender = ?
        ORDER BY p.id DESC;`

	rows, err := db.Query(query, id)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Sender.ID, &post.ParentID, &post.Title, &post.Content, &post.Picture, &post.Date, &post.Sender.Username, &post.Sender.Email, &post.Sender.Picture)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		post.NbComments, err = NbCommentsFromPost(post.ID)
		if err != nil {
			post.NbComments = 0
			fmt.Println("Error at fetching nb comments: ", err)
		}

		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return posts

}

func SortPostsByDateDesc(posts []Post) {
	// Définir le layout pour analyser les dates
	const layout = "15:04 | 02/01/2006"

	sort.Slice(posts, func(i, j int) bool {
		// Convertir les dates en objets time.Time
		date1, err1 := time.Parse(layout, posts[i].Date)
		date2, err2 := time.Parse(layout, posts[j].Date)

		// Si la conversion échoue, on considère la date comme moins récente
		if err1 != nil || err2 != nil {
			return err1 != nil
		}

		// Trier par ordre antichronologique (plus récente en premier)
		return date1.After(date2)
	})
}

func SelectPostByID(postID int) (Post, error) {
	db := GetDB()
	defer db.Close()

	query := `
			SELECT p.id, p.sender, p.parent_id, p.title, p.content, p.picture, p.date,
				   IFNULL(u.username, 'Deleted User') AS username,
				   IFNULL(u.email, '') AS email,
				   IFNULL(u.picture, 'default-profile.png') AS picture
			FROM posts p
			LEFT JOIN users u ON p.sender = u.id
			WHERE p.id = ?;`

	var post Post
	err := db.QueryRow(query, postID).Scan(&post.ID, &post.Sender.ID, &post.ParentID, &post.Title, &post.Content, &post.Picture, &post.Date, &post.Sender.Username, &post.Sender.Email, &post.Sender.Picture)
	if err != nil {
		if err == sql.ErrNoRows {
			return Post{}, errors.New("post not found")
		}
		return Post{}, err
	}

	post.NbComments, err = NbCommentsFromPost(post.ID)
	if err != nil {
		post.NbComments = 0
		fmt.Println("Error at fetching nb comments: ", err)
	}
	return post, nil
}

func DeletePostByID(postID int) error {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	recursive := `
		WITH RECURSIVE comments_tree AS (
    		SELECT id FROM posts WHERE id = ?
    		UNION ALL
    		SELECT p.id FROM posts p
    		JOIN comments_tree ct ON p.parent_id = ct.id
		)`

	queries := []string{
		"DELETE FROM posts WHERE id IN (SELECT id FROM comments_tree);",
	}

	rowsAffected := int64(0)
	for _, query := range queries {
		query = recursive + query
		result, err := tx.Exec(query, postID)
		if err != nil {
			tx.Rollback()
			return err
		}
		affected, _ := result.RowsAffected()
		rowsAffected += affected
	}

	if rowsAffected == 0 {
		tx.Rollback()
		return fmt.Errorf("the requested post doesn't exist")
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func ModifyContentPostByID(postID int, content string) error {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	update := `UPDATE posts SET content = ? WHERE id = ?;`

	if _, err := tx.Exec(update, content, postID); err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}
