# Cricket Scoring App

A real-time cricket scoreboard application with ball-by-ball commentary.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis, Socket.IO
- **Frontend**: React with Next.js

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)
- Redis (running on localhost:6379)

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
\`\`\`

### 2. Start the Services
Make sure MongoDB and Redis are running on your system.

### 3. Run the Application
\`\`\`bash
# Terminal 1: Start Backend (from project root)
cd backend
npm run dev

# Terminal 2: Start Frontend (from project root)
npm run dev
\`\`\`

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints
- `POST /matches/start` - Start a new match
- `POST /matches/:id/commentary` - Add commentary to a match
- `GET /matches/:id` - Get match details with commentary
- `GET /matches` - Get all matches

## Features
- Real-time commentary updates via WebSocket
- Auto-incrementing 4-digit match IDs
- Ball-by-ball commentary tracking
- Live match scoreboard

## Project Structure
\`\`\`
├── app/                    # Next.js frontend pages
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   └── server.ts     # Main server file
│   └── package.json
├── package.json          # Frontend dependencies
└── README.md
