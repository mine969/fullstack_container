#!/bin/bash

# Oracle Cloud Deployment Setup Script
# This script installs Docker, Docker Compose, and sets up the application.
# It is designed to be run on an Ubuntu/Debian-based Oracle Cloud VM.

set -e

echo "Starting Oracle Cloud Setup..."

# 1. Update System
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo "Docker installed. You may need to log out and back in for group changes to take effect."
else
    echo "Docker is already installed."
fi

# 3. Setup Environment Variables
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example. PLEASE EDIT .env WITH SECURE PASSWORDS!"
        
        # Generate random passwords for security
        DB_PASS=$(openssl rand -base64 12)
        ROOT_PASS=$(openssl rand -base64 12)
        
        # Update .env with generated passwords (simple sed replacement)
        sed -i "s/MYSQL_PASSWORD=userpassword/MYSQL_PASSWORD=$DB_PASS/" .env
        sed -i "s/MYSQL_ROOT_PASSWORD=rootpassword/MYSQL_ROOT_PASSWORD=$ROOT_PASS/" .env
        
        echo "Generated secure passwords for database."
    else
        echo "Error: .env.example not found!"
        exit 1
    fi
else
    echo ".env file already exists. Skipping creation."
fi

# 3.5 Configure Public IP/Domain
echo "Configuring Public IP/Domain..."
if ! grep -q "NEXT_PUBLIC_API_URL" .env; then
    read -p "Enter your Oracle Cloud VM Public IP or Domain (e.g., 123.45.67.89): " PUBLIC_IP
    if [ ! -z "$PUBLIC_IP" ]; then
        # Remove trailing slash if user added it
        PUBLIC_IP=${PUBLIC_IP%/}
        
        # Check if it starts with http, if not add http://
        if [[ "$PUBLIC_IP" != http* ]]; then
            PUBLIC_IP="http://$PUBLIC_IP"
        fi
        
        echo "Setting API URL to $PUBLIC_IP:3001"
        
        # Add NEXT_PUBLIC_API_URL to .env
        echo "" >> .env
        echo "NEXT_PUBLIC_API_URL=$PUBLIC_IP:3001" >> .env
        
        # Also update API_HOST
        sed -i "s|API_HOST=http://localhost:3001|API_HOST=$PUBLIC_IP:3001|g" .env
    else
        echo "No IP provided. Defaulting to localhost (might not work for remote access)."
    fi
else
    echo "NEXT_PUBLIC_API_URL already set in .env. Skipping configuration."
fi

# 4. Build and Start Containers
echo "Building and starting containers..."
# Use the docker compose command (v2)
sudo docker compose up -d --build

echo "Deployment script completed!"
echo "Your application should be running."
echo "Frontend: http://<YOUR_VM_IP>:3000"
echo "Backend API: http://<YOUR_VM_IP>:3001"
echo "PHPMyAdmin: http://<YOUR_VM_IP>:8888"
echo ""
echo "IMPORTANT: Ensure these ports (3000, 3001, 8888) are open in your Oracle Cloud Security List and local firewall (iptables/ufw)."
