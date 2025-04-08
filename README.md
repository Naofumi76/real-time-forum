# Real-Time Forum

## Overview

Real-Time Forum is a web application that allows users to create accounts, share posts, comment on posts, and exchange private messages in real-time. This project demonstrates modern web development practices using Go for the backend and JavaScript for the frontend.

## Features

- **User Authentication**:
  - User registration with profile information
  - Secure login with session management
  - Password hashing for security

- **Post Management**:
  - Create text and image posts
  - Comment on existing posts
  - View posts in a feed format

- **Real-Time Communication**:
  - Private messaging between users
  - Online user status tracking

- **Responsive UI**:
  - Modern interface with responsive design
  - Dynamic content loading
  - Sidebar navigation

## Technologies Used

### Backend
- **Go** - Server-side language
- **SQLite** - Database for storing user data, posts, and messages
- **bcrypt** - Password hashing
- **UUID** - Session management

### Frontend
- **JavaScript** - Client-side scripting
- **HTML5/CSS3** - Markup and styling
- **Fetch API** - AJAX requests

## Project Structure

```
real-time-forum/
├── db/                                         # Database related code
│   ├── db.go                                   # Database connection and setup
│   ├── db_model.go                             # Data models
│   ├── user.go                                 # User-related database operations
│   ├── post.go                                 # Post-related database operations
│   ├── message.go                              # Message-related database operations
│   └── session.go                              # Session management
│
├── handlers/                                   # HTTP request handlers
│   ├── login_handler.go                        # Login functionality
│   ├── signup_handler.go                       # Registration functionality
│   ├── showpost_handler.go                     # Post display functionality
│   ├── showcomment_handler.go                  # Comment display functionality
│   ├── createpost_handler.go                   # Creating post functionality
│   ├── sendmessage_handler.go                  # Sending message functionality
│   ├── getmessage_handler.go                   # Getting message functionality
│   └── session_handler.go                      # Session functionality
│
├── static/                                     # Frontend files
│   ├── css/                                    # CSS stylesheets
│   │   ├── style.css                           # Main stylesheet
│   │   ├── sideBar.css                         # Sidebar styles
│   │   └── ...                                 # Other style files
│   │
│   ├── main.js                                 # Main JavaScript entry point
│   ├── user.js                                 # User-related functionality
│   ├── post.js                                 # Post-related functionality
│   └── ...                                     # Other JavaScript modules
│
├── utils/                                      # Utility functions
│   └── image.go                                # Image processing utilities
│
├── server.go                                   # Main application server
└── go.mod                                      # Go module definition
```

## Installation

1. **Prerequisites**:
   - Go (version 1.22 or higher)
   - Modern web browser

2. **Clone the repository**:
   ```
   git clone https://github.com/Naofumi76/real-time-forum
   cd real-time-forum
   ```

3. **Install dependencies**:
   ```
   go mod tidy
   ```

4. **Run the application**:
   ```
   go run server.go
   ```

5. **Access the application**:
   Open your web browser and navigate to `http://localhost:8080`
   
## Usage

### Registration and Login
1. Access the application's homepage (`http://localhost:8080`)
2. Click the "Signup" button and complete the registration form
3. After registration, you'll be automatically logged in
4. For future sessions, use the "Login" button with your credentials

### Creating Posts
1. Click the "Create Post" button in the sidebar
2. Fill in the title and content, and optionally upload an image
3. Submit your post to publish it

### Interacting with Posts
1. View posts on the homepage feed
2. Click "Comments" to view or add comments to a post

### Private Messaging
1. Navigate to the contacts section via the sidebar
2. Select a user to message
3. Exchange messages in real-time

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Go](https://golang.org/)
- [SQLite](https://www.sqlite.org/)
- [bcrypt](https://godoc.org/golang.org/x/crypto/bcrypt)


## Credits

This project was made by Naofumi76 and Yssnogood, check out our github :
- [Naofumi76](https://github.com/Naofumi76)
- [Yssnogood](https://github.com/Yssnogood)