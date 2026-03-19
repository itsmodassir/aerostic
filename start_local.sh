#!/bin/bash

# Simple script to start Aerostic services for local development
echo "🚀 Starting Aerostic Services..."

# 1. Start Backend
echo "📦 Starting Backend API (Port 3001)..."
cd backend && npm run start:dev &

# 2. Start Frontend
echo "💻 Starting Frontend Dashboard (Port 3000)..."
cd frontend/app-dashboard && npm run dev &

echo "✅ Services starting in background. Check logs for details."
wait
