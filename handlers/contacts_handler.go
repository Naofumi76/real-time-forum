package handlers

import (
    "encoding/json"
    "net/http"
    "real-time/db"
	"fmt"
	"log"
)

func ContactsHandler(w http.ResponseWriter, r *http.Request){

	contacts, err := db.FetchAllUsers()

	fmt.Println("Contacts : ", contacts)

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(contacts)
	if err != nil {
		log.Printf("Error encoding JSON: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

}