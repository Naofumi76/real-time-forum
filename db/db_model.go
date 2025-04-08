package db

type User struct {
	ID        int
	Username  string
	Email     string
	Age       int
	Gender    string
	FirstName string
	LastName  string
	Picture   string
	Password  string
}

type Post struct {
	ID         int
	Sender     User
	ParentID   int
	Title      string
	Content    string
	Picture    string
	Date       string
	NbComments int
}

type Message struct {
	ID       int
	Sender   User
	Receiver User
	Content  string
	Date     string
	Picture  string
}
