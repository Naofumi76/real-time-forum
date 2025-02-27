package db

import (
	"errors"
	"log"
	"net/http"

	"github.com/gofrs/uuid"
)

func AddConnectedUser(userID int, sessionUUID string) error {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare("INSERT INTO sessions(connected_user, uuid) VALUES(?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, sessionUUID)
	if err != nil {
		tx.Rollback()
		return errors.New("session already exists")
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func IsUserConnected(userID int) (bool, error) {
	db := GetDB()
	defer db.Close()

	var exists bool
	err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM sessions WHERE connected_user = ? LIMIT 1)`, userID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func DeleteConnectedUser(sessionUUID string) error {
	db := GetDB()
	defer db.Close()

	_, err := db.Exec(`DELETE FROM sessions WHERE uuid = ?`, sessionUUID)
	if err != nil {
		log.Printf("Error when deleting session: %v", err)
		return err
	}
	return nil
}

func GetUserIDBySessionUUID(sessionUUID string) (int, error) {
	db := GetDB()
	defer db.Close()

	var userID int
	err := db.QueryRow(`SELECT connected_user FROM sessions WHERE uuid = ?`, sessionUUID).Scan(&userID)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

func GetUUIDByUserID(id int) (string, error) {
	db := GetDB()
	defer db.Close()

	var uuid string
	err := db.QueryRow(`SELECT uuid FROM sessions WHERE connected_user = ?`, id).Scan(&uuid)
	if err != nil {
		return "", err
	}

	return uuid, nil
}

func SetSession(w http.ResponseWriter, username string) {
	sessionUUID, err := uuid.NewV4()
	if err != nil {
		panic(err)
	}

	// Fetch the user by username
	user, err := SelectUserByUsername(username)
	if err != nil {
		panic(err)
	}

	if connected, _ := IsUserConnected(user.ID); connected {
		id, _ := GetUUIDByUserID(user.ID)
		DeleteConnectedUser(id)
		SetSession(w, username)
		return
	}

	err = AddConnectedUser(user.ID, sessionUUID.String())
	if err != nil {
		panic(err)
	}

	cookie := http.Cookie{
		Name:     "session_token",
		Value:    sessionUUID.String(),
		MaxAge:   3600,
		HttpOnly: true,
		Path:     "/",
	}

	http.SetCookie(w, &cookie)
}

func ClearSession(w http.ResponseWriter, r *http.Request, name string) {
	cookie, err := r.Cookie(name)
	if err != nil {
		panic(err)
	}

	if name == "session_token" {
		err = DeleteConnectedUser(cookie.Value)
		if err != nil {
			panic(err)
		}
	}

	cookie = &http.Cookie{
		Name:   name,
		MaxAge: -1,
	}
	http.SetCookie(w, cookie)
}

func GetUserFromCookie(w http.ResponseWriter, r *http.Request) *User {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return nil
	}

	userID, err := GetUserIDBySessionUUID(cookie.Value)
	if err != nil {
		ClearSession(w, r, "session_token")
		return nil
	}

	user, err := SelectUserByID(userID)
	if err != nil {
		ClearSession(w, r, "session_token")
		return nil
	}

	return &user
}

func IsCookieValid(w http.ResponseWriter, r *http.Request) bool {
	return GetUserFromCookie(w, r) != nil
}
