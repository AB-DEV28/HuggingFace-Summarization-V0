# HuggingFace Summarization Platform

A full-stack web application for text summarization using HuggingFace models. This platform allows users to create chat-based sessions, submit text for summarization, and generate meta-summaries of all content within a session.

## Project Overview

This project consists of three main components:

1. **Backend API**: A FastAPI-based RESTful service that handles authentication, data storage, and interacts with HuggingFace models
2. **Frontend Application**: A Next.js web application that provides a user-friendly interface for the summarization service
3. **MongoDB Database**: Stores user data, chat sessions, and summaries

## Getting Started with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- A HuggingFace API token (register at [HuggingFace](https://huggingface.co/join) and get your token from [Settings > Access Tokens](https://huggingface.co/settings/tokens))

### Quick Start

#### For Windows Users:
```bash
# Simply run the batch file
start.bat
```

#### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x start.sh

# Run the application
./start.sh
```

These scripts will:
1. Check if Docker and Docker Compose are installed
2. Create a sample `.env` file if one doesn't exist
3. Build and start all containers
4. Provide access information once the application is running

### Manual Setup Instructions

If you prefer not to use the scripts, you can directly use Docker Compose:

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd huggingface-summarization
   ```

2. Create or edit the `.env` file in the `backend` directory:
   ```
   MONGO_URI=mongodb://admin:adminpassword@mongo:27017/textsummarization?authSource=admin
   HF_TOKEN=your_huggingface_token
   SECRET_KEY=your_secret_key_for_jwt
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DB_NAME=textsummarization
   ENVIRONMENT=development
   HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-cnn
   ```
   
   > **IMPORTANT**: Replace `your_huggingface_token` with your actual HuggingFace API token.

3. Start the entire application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Commands Reference

```bash
# Start all services
docker-compose up -d

# Start and rebuild services
docker-compose up -d --build

# View running containers
docker-compose ps

# View logs of all services
docker-compose logs -f

# View logs of a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Stop all services
docker-compose down

# Stop and remove all containers and volumes (will delete all data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# Check the health of services
docker-compose ps
```

## Docker Architecture

The platform uses a multi-container setup with Docker Compose:

1. **mongo**: MongoDB database for storing user data, sessions, and summaries
   - Persists data in a Docker volume
   - Uses authentication for security
   - Exposed on port 27017

2. **backend**: FastAPI application that provides the REST API
   - Connects to MongoDB and HuggingFace API
   - Handles user authentication and data processing
   - Exposed on port 8000

3. **frontend**: Next.js application that provides the user interface
   - Communicates with the backend API
   - Provides responsive UI for all devices
   - Exposed on port 3000

All containers are connected via a Docker network named `app-network`.

## Using the Application

1. **Register/Login**: Create an account or log in with existing credentials
2. **Create a Session**: Start a new summarization session with a descriptive title
3. **Generate Summaries**: Submit text to be summarized, adjusting parameters as needed
4. **Meta-Summarize**: Generate a comprehensive summary of all content in a session

## Troubleshooting Docker Issues

If you encounter any issues:

1. **Container not starting**:
   - Check logs: `docker-compose logs [service-name]`
   - Ensure Docker daemon is running
   - Check if ports are already in use

2. **MongoDB connection issues**:
   - Verify MongoDB container is running: `docker-compose ps mongo`
   - Check MongoDB logs: `docker-compose logs mongo`
   - Ensure the `MONGO_URI` in backend's `.env` file is correct

3. **HuggingFace API issues**:
   - Verify your HF_TOKEN is valid
   - Check internet connectivity from the backend container

4. **Frontend not connecting to backend**:
   - Ensure backend is running and healthy
   - Check Next.js configuration in `frontend/next.config.js`
   - Check network settings in `docker-compose.yml`

5. **Data persistence issues**:
   - Check if the volume is properly mounted: `docker volume ls`

6. **Rebuilding after code changes**:
   - Use `docker-compose up -d --build` to rebuild containers

## Advanced Docker Configuration

### Environment Variables

You can modify these environment variables in the `.env` file or docker-compose.yml:

- **MONGO_URI**: Connection string for MongoDB
- **HF_TOKEN**: Your HuggingFace API token 
- **SECRET_KEY**: Secret key for JWT encryption
- **ACCESS_TOKEN_EXPIRE_MINUTES**: Token expiration time

### Volume Management

The application uses a Docker volume to persist MongoDB data:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect huggingface_summarization_mongo-data
```

### Container Shell Access

You can access the shell of any container for debugging:

```bash
# Access backend shell
docker-compose exec backend bash

# Access MongoDB shell
docker-compose exec mongo mongosh -u admin -p adminpassword
```

## Manual Setup (Without Docker)

If you prefer to run the components separately without Docker, follow the README instructions in the respective directories:

- [Backend Setup Instructions](./backend/README.md)
- [Frontend Setup Instructions](./frontend/README.md)

## Features

- **User Authentication**: Secure login/registration system with JWT tokens
- **Chat Sessions**: Create and manage multiple summarization sessions
- **Text Summarization**: Generate concise summaries from long texts using HuggingFace models
- **Meta-Summarization**: Distill multiple summaries into a single comprehensive overview
- **Responsive Design**: Works seamlessly across devices (mobile, tablet, desktop)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 