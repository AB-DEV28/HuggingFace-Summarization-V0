#!/bin/bash

# ASCII art banner
echo "
 _   _                   _             ______                
| | | |                 (_)            |  ___|               
| |_| |_   _  __ _  __ _ _ _ __   __ _ | |_ __ _  ___ ___   
|  _  | | | |/ _\` |/ _\` | | '_ \ / _\` ||  _/ _\` |/ __/ _ \  
| | | | |_| | (_| | (_| | | | | | (_| || || (_| | (_|  __/  
\_| |_/\__,_|\__, |\__, |_|_| |_|\__, ||_| \__,_|\___\___|  
              __/ | __/ |         __/ |                     
             |___/ |___/         |___/                      
    _____                                    _              
   /  ___|                                  (_)             
   \ \`--.  _   _ _ __ ___  _ __ ___   __ _ _ _______ _ __  
    \`--. \| | | | '_ \` _ \| '_ \` _ \ / _\` | |_  / _ \ '_ \ 
   /\__/ /| |_| | | | | | | | | | | | (_| | |/ /  __/ | | |
   \____/  \__,_|_| |_| |_|_| |_| |_|\__,_|_/___\___|_| |_|
                                                           
"

echo "Starting HuggingFace Summarization Platform..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists in backend directory
if [ ! -f "./backend/.env" ]; then
    echo "Warning: No .env file found in backend directory."
    echo "Creating a sample .env file..."
    
    # Create a sample .env file
    cat > ./backend/.env << EOL
# Please replace with your actual values
MONGO_URI=mongodb://admin:adminpassword@mongo:27017/textsummarization?authSource=admin
HF_TOKEN=your_huggingface_token
SECRET_KEY=sample_secret_key_replace_this
ACCESS_TOKEN_EXPIRE_MINUTES=30
DB_NAME=textsummarization
EOL
    
    echo "Sample .env file created. Please edit it with your actual values before continuing."
    echo "Specifically, you need to update the HF_TOKEN with your HuggingFace API token."
    echo "Press Enter to continue or Ctrl+C to exit and update the .env file..."
    read
fi

# Start the application with docker-compose
echo "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "
✅ Application started successfully!

📊 Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

💻 Useful commands:
   - View logs: docker-compose logs -f
   - Stop application: docker-compose down
   - View container status: docker-compose ps
"
else
    echo "❌ Some services might have failed to start. Please check the logs:"
    echo "   docker-compose logs -f"
fi 