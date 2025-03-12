# Text Summarization API

A RESTful API for text summarization using HuggingFace models, offering user-based chat sessions with summaries.

## Architecture

This API follows a session-based approach where:
- Users create chat sessions
- Each chat session contains multiple summaries
- Users can generate a meta-summary of all summaries in a session
- Authentication is JWT-based with secure cookies

## Running with Docker

### Prerequisites
- Docker and Docker Compose installed
- HuggingFace API token (get from https://huggingface.co/settings/tokens)

### Steps
1. Clone the repository
2. Update the HuggingFace token in `.env.docker`:
   ```
   HF_TOKEN=your_huggingface_token
   ```
3. Start the containers:
   ```bash
   docker-compose up -d
   ```
4. The API is now running at http://localhost:8000
5. Access the documentation at http://localhost:8000/docs

### Stopping Docker Containers
```bash
docker-compose down
```

## Running Locally

### Prerequisites
- Python 3.9+
- MongoDB instance (local or cloud)

### Steps
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   HF_TOKEN=your_huggingface_token
   SECRET_KEY=your_secret_key
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DB_NAME=textsummarization
   ENVIRONMENT=development
   HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-cnn
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. The API is now running at http://localhost:8000

## API Documentation

### Authentication Flow

1. Register or login to get an access token
2. Token is stored as an HTTP-only cookie
3. Include the cookie in all subsequent requests
4. Token expires after the configured time (default: 30 minutes)

### Authentication Endpoints

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpassword"  // minimum 8 characters
}

Response: 201 Created
Set-Cookie: access_token=<jwt_token>
{
  "email": "user@example.com",
  "message": "User created and logged in successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpassword"
}

Response: 200 OK
Set-Cookie: access_token=<jwt_token>
{
  "email": "user@example.com",
  "message": "Login successful"
}
```

#### Logout
```http
POST /auth/logout

Response: 200 OK
Set-Cookie: access_token='' (cleared)
{
  "message": "Logged out successfully"
}
```

#### Get Current User Info
```http
GET /auth/me
Cookie: access_token=<jwt_token>

Response: 200 OK
{
  "email": "user@example.com",
  "message": "User information retrieved successfully"
}
```

#### Update User Profile
```http
PATCH /auth/me
```
Request:
```json
{
  "email": "newemail@example.com",  // optional
  "password": "newpassword"         // optional, min 8 chars
}
```
Headers:
```http
Content-Type: application/json
```
Response (200 OK):
```json
{
  "email": "newemail@example.com",
  "message": "User updated successfully"
}
```

#### Delete User Account
```http
DELETE /auth/me
```
Response (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

### Chat Session Flow

1. Create a new chat session
2. Add summaries to the session
3. Optionally generate a meta-summary
4. View or update session details

### Chat Session Endpoints

#### Create Chat Session
```http
POST /chat/sessions
Cookie: access_token=<jwt_token>
Content-Type: application/json

{
  "title": "Research on AI Ethics"  // 1-100 characters
}

Response: 201 Created
{
  "session_id": 1,
  "message": "Chat session created successfully"
}
```

#### Get Chat Session
```http
GET /chat/sessions/{session_id}
Cookie: access_token=<jwt_token>

Response: 200 OK
{
  "id": 1,
  "title": "Research on AI Ethics",
  "summaries": [
    {
      "original_text": "Long text...",
      "summary_text": "Summary...",
      "parameters": {
        "min_length": 50,
        "max_length": 200,
        "do_sample": false
      },
      "created_at": "2024-03-03T12:00:00Z"
    }
  ],
  "created_at": "2024-03-03T12:00:00Z",
  "updated_at": "2024-03-03T12:00:00Z",
  "meta_summary": null
}
```

#### Update Chat Session Title
```http
PATCH /chat/sessions/{session_id}?title=New%20Title
Cookie: access_token=<jwt_token>

Response: 200 OK
{
  "id": 1,
  "title": "New Title",
  "summaries": [...],
  "created_at": "2024-03-03T12:00:00Z",
  "updated_at": "2024-03-03T12:01:00Z",
  "meta_summary": null
}
```

#### Delete Chat Session
```http
DELETE /chat/sessions/{session_id}
```
Response (200 OK):
```json
{
  "message": "Chat session deleted successfully"
}
```

### Summary Flow

1. Add text to summarize to a chat session
2. Configure summarization parameters
3. Receive generated summary
4. Optionally generate meta-summary of all summaries

### Summary Endpoints

#### Add Summary to Chat Session
```http
POST /chat/summarize
Cookie: access_token=<jwt_token>
Content-Type: application/json

{
  "text": "Long text to summarize...",  // minimum 100 characters
  "session_id": 1,
  "parameters": {
    "min_length": 50,     // 10-1000
    "max_length": 200,    // 50-1000
    "do_sample": false
  }
}

Response: 201 Created
{
  "session_id": 1,
  "summary_index": 0,
  "original_text": "Long text...",
  "summary_text": "Generated summary...",
  "parameters": {
    "min_length": 50,
    "max_length": 200,
    "do_sample": false
  },
  "created_at": "2024-03-03T12:00:00Z"
}
```

#### Update Summary in Chat Session
```http
PATCH /chat/summarize/{summary_id}
Cookie: access_token=<jwt_token>
Content-Type: application/json

{
  "text": "Updated long text to summarize...",  // minimum 100 characters
  "parameters": {
    "min_length": 50,     // 10-1000
    "max_length": 200,    // 50-1000
    "do_sample": false
  }
}

Response: 200 OK
{
  "session_id": 1,
  "summary_index": 0,
  "original_text": "Updated long text...",
  "summary_text": "Updated generated summary...",
  "parameters": {
    "min_length": 50,
    "max_length": 200,
    "do_sample": false
  },
  "created_at": "2024-03-03T12:00:00Z"
}
```

#### Generate Meta-Summary
```http
POST /chat/meta-summarize
Cookie: access_token=<jwt_token>
Content-Type: application/json

{
  "session_id": 1,
  "parameters": {  // optional
    "min_length": 100,
    "max_length": 300,
    "do_sample": false
  }
}

Response: 200 OK
{
  "session_id": 1,
  "title": "Session Title",
  "meta_summary": "Generated meta-summary...",
  "created_at": "2024-03-03T12:00:00Z"
}
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

#### 400 Bad Request
```json
{
  "detail": "Error message describing the validation error"
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

## Important Notes

1. Authentication:
   - All endpoints except /auth/register and /auth/login require authentication
   - Authentication is via HTTP-only cookies containing JWT tokens
   - Tokens expire after the configured time (default: 30 minutes)

2. Text Requirements:
   - Minimum text length for summarization: 100 characters
   - Meta-summary requires at least one summary in the session

3. Summary Parameters:
   - min_length: 10-1000 characters
   - max_length: 50-1000 characters (must be > min_length)
   - do_sample: boolean flag for sampling during generation

4. Rate Limiting:
   - HuggingFace API has rate limits
   - Consider implementing exponential backoff for retries

5. Security:
   - All sensitive data is transmitted via HTTPS
   - Passwords are hashed using bcrypt
   - JWT tokens are stored in HTTP-only cookies
   - CORS protection is enabled

6. Error Handling:
   - All endpoints return appropriate HTTP status codes
   - Error responses include descriptive messages
   - Input validation is enforced on all endpoints
