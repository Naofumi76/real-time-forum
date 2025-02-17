package db

type User struct {
	ID       int
	Provider string
	Role     string
	Username string
	Email    string
	Picture  string
	Password string
}

type Post struct {
	ID         int
	Sender     User
	ParentID   int
	Title      string
	Content    string
	Picture    string
	Date       string
	Likes      int
	Dislikes   int
	NbComments int
}
