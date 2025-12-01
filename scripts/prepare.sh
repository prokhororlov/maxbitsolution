#!/bin/bash

if [ ! -d "backend" ]; then
  git clone https://github.com/maxbit-solution/frontend_technical_task.git backend
fi
cd backend

echo "Installing backend dependencies..."
npm install
