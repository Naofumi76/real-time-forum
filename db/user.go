package db

import (
	"database/sql"
	"errors"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func CreateUser(username, email string, age int, gender, first_name, last_name, password string) (*User, error) {
	db := GetDB()
	defer db.Close()

	// Vérifier si l'utilisateur existe déjà
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = ? OR email = ?)", username, email).Scan(&exists)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New("the email address or username already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Préparer la requête d'insertion
	stmt, err := db.Prepare("INSERT INTO users(username, email, age, gender, first_name, last_name, password) VALUES(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(username, email, age, gender, first_name, last_name, string(hashedPassword))
	if err != nil {
		return nil, err
	}

	user, _ := SelectUserByUsername(username)
	return user, nil
}

func SelectUserByID(userID int) (User, error) {
	db := GetDB()
	defer db.Close()

	var user User
	err := db.QueryRow(`
	SELECT u.id, u.username, u.email, u.age, u.gender, u.first_name, u.last_name, u.password
	FROM users u
	WHERE id = ?`,
		userID).Scan(&user.ID, &user.Username, &user.Email, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return User{}, errors.New("user not found")
		}
		return User{}, err
	}

	return user, nil
}

func SelectUserByUsername(username string) (*User, error) {
	db := GetDB()
	defer db.Close()

	var user User
	err := db.QueryRow(`
	SELECT u.id, u.username, u.email, u.age, u.gender, u.first_name, u.last_name, u.password
	FROM users u
	WHERE username = ?`,
		username).Scan(&user.ID, &user.Username, &user.Email, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

func DeleteUserByUsername(username string) error {
	db := GetDB()
	defer db.Close()

	// Retrieve the user ID to delete
	var userID int
	err := db.QueryRow(`SELECT id FROM users WHERE username = ?`, username).Scan(&userID)
	if err != nil {
		log.Printf("Error retrieving user ID: %v", err)
		return err
	}

	// Update posts by this user to set sender to 0
	_, err = db.Exec(`UPDATE posts SET sender = 0 WHERE sender = ?`, userID)
	if err != nil {
		log.Printf("Error updating posts sender to 0: %v", err)
		return err
	}

	// Now delete the user
	_, err = db.Exec(`DELETE FROM users WHERE id = ?`, userID)
	if err != nil {
		log.Printf("Error when deleting user: %v", err)
		return err
	}

	return nil
}

func IsPasswordValid(providedPassword, storedHash string) bool {
	// Comparer le mot de passe fourni avec le hash stocké
	err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(providedPassword))

	// Si err est nil, cela signifie que les mots de passe correspondent
	return err == nil
}

func UserExist(id int) bool {
	db := GetDB()
	defer db.Close()

	var exist bool
	err := db.QueryRow("SELECT EXISTS( SELECT 1 FROM users WHERE id = ?)", id).Scan(&exist)
	if err != nil {
		return exist
	}
	return exist
}

func UserExistByEmail(email string) bool {
	db := GetDB()
	defer db.Close()

	var exist bool
	err := db.QueryRow("SELECT EXISTS( SELECT 1 FROM users WHERE email = ?)", email).Scan(&exist)
	if err != nil {
		return exist
	}
	return exist
}

func UserExistByUsername(username string) bool {
	db := GetDB()
	defer db.Close()

	var exist bool
	err := db.QueryRow("SELECT EXISTS( SELECT 1 FROM users WHERE username = ?)", username).Scan(&exist)
	if err != nil {
		return exist
	}
	return exist
}

func SelectUserByEmail(email string) (*User, error) {
	db := GetDB()
	defer db.Close()

	var user User
	err := db.QueryRow(`
	SELECT u.id, u.username, u.email, u.password
	FROM users u
	WHERE email = ?`,
		email).Scan(&user.ID, &user.Username, &user.Email, &user.Picture, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}
