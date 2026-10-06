# One-to-One Chat Application

A simple real-time one-to-one chat application built using Spring Boot, MongoDB, JWT authentication, WebSocket/STOMP, and React.

The application allows users to register, login securely, view other users, create one-to-one conversations, send messages in real time, and view previous messages.

---

## Features

- User registration
- User login
- JWT-based authentication
- BCrypt password hashing
- Duplicate email validation
- View registered users
- Create one-to-one conversations
- Real-time messaging using WebSocket and STOMP
- Store messages in MongoDB
- Retrieve previous messages
- Conversation-based message history
- Authentication for WebSocket connections
- Validation for API requests
- Separate sessions for different browser tabs
- Simple React frontend

---

## Technology Stack

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Web
- Spring WebSocket
- STOMP
- JWT
- MongoDB
- Spring Data MongoDB
- Maven

### Frontend

- React
- Vite
- JavaScript
- STOMP.js
- HTML
- CSS

---

## Project Structure

```text
WebSocket
│
├── src
│   └── main
│       └── java
│           └── com.example.WebSocket
│               │
│               ├── Configuration
│               │   ├── CorsConfig.java
│               │   ├── SecurityConfiguration.java
│               │   └── WebSocketConfig.java
│               │
│               ├── Controller
│               │   ├── ChatController.java
│               │   ├── ConversationController.java
│               │   └── UserController.java
│               │
│               ├── DTO
│               │   ├── ChatMessageRequest.java
│               │   ├── ConversationRequest.java
│               │   ├── LoginRequest.java
│               │   ├── RegisterRequest.java
│               │   └── UserResponse.java
│               │
│               ├── Entity
│               │   ├── ChatMessage.java
│               │   ├── Conversation.java
│               │   └── User.java
│               │
│               ├── Exception
│               │   └── GlobalExceptionHandler.java
│               │
│               ├── Repository
│               │   ├── ChatMessageRepository.java
│               │   ├── ConversationRepository.java
│               │   └── UserRepository.java
│               │
│               ├── Security
│               │   ├── JwtAuthenticationFilter.java
│               │   └── WebSocketAuthInterceptor.java
│               │
│               └── Service
│                   ├── ChatMessageService.java
│                   ├── ConversationService.java
│                   ├── JwtService.java
│                   └── UserService.java
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── pom.xml
└── application.properties