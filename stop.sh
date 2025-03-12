#!/bin/bash

echo "Stopping HuggingFace Summarization Platform..."

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Cannot stop services."
    exit 1
fi

# Ask user if they want to keep data
read -p "Do you want to remove all data (MongoDB volume)? (y/N): " REMOVE_DATA

if [[ $REMOVE_DATA =~ ^[Yy]$ ]]; then
    echo "Stopping containers and removing volumes..."
    docker-compose down -v
    echo "All containers and volumes have been removed."
else
    echo "Stopping containers but keeping data volumes..."
    docker-compose down
    echo "All containers have been stopped. Data volumes are preserved."
fi

echo "Cleanup complete!" 