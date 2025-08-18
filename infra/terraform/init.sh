#!/bin/bash

set -e

# Update system and install dependencies
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add ubuntu user to docker group so docker commands don't require sudo
usermod -aG docker ubuntu

# Install docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Prepare app directory
rm -rf /home/ubuntu/app
git clone https://github.com/moaz321/Team-Task.git /home/ubuntu/app

cd /home/ubuntu/app

# Make sure your GitHub env file exists or copy a template

# Just to be safe, touch .env.local if missing (empty file)
if [ ! -f .env.local ]; then
  touch .env.local
fi

# Start Docker Compose app
/usr/local/bin/docker-compose down
/usr/local/bin/docker-compose up -d
