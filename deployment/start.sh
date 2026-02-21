#!/bin/bash
echo "🚀 Starting Aerostic..."
cd infrastructure/docker
docker-compose down
docker-compose up --build -d
echo "✅ Backend running at http://localhost:3001"
echo "✅ Frontend running at http://localhost:3000"
echo "✅ Admin Panel at http://localhost:3000/admin"
