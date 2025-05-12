#!/bin/bash

# Update & install base tools
sudo apt update -y
sudo apt install -y curl git nginx maven

# Install OpenJDK 21 (from PPA)
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:openjdk-r/ppa -y
sudo apt update -y
sudo apt install -y openjdk-21-jdk

# Verify Java & Maven
java -version
mvn -version

# Install Node.js (18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# Clean existing NGINX HTML directory
sudo rm -rf /var/www/html/*

# Clean up existing site configs
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/conf.d/*

# Add your React app config
sudo tee /etc/nginx/conf.d/react.conf > /dev/null << 'EOF'
server {
    listen 80;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
}
EOF

git clone https://github.com/gopinathsjsu/team-project-2024849-aviato.git
cd team-project-2024849-aviato
cd ThaliBook
cd backend
mvn clean install
cd target
nohup java -jar ./backend-0.0.1-SNAPSHOT.jar > /home/ubuntu/team-project-2024849-aviato/ThaliBook/backend/app.log 2>&1 &
cd ../../frontend
npm install

# Build the app
npm run build

# Deploy to NGINX directory
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/



# Reload NGINX and restart NGINX
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl restart nginx
