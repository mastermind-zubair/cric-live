# Cricket Scoreboard Application

A full-stack cricket scoreboard application built with Express.js, MongoDB, and vanilla JavaScript.

## Features

- Live cricket score tracking
- Detailed batting and bowling scorecards
- Admin authentication
- Match lineup configuration
- Real-time score updates via polling
- Ball-by-ball game control

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- bcryptjs for password hashing

### Frontend
- Vanilla JavaScript (ES6 modules)
- Bootstrap 5
- HTML5

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

### Installation

1. Clone the repository
```bash
cd cric-live
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
Create a `.env` file in the `backend` directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cricket-scoreboard
JWT_SECRET=cricket-scoreboard-secret-key-2024
```

4. Start MongoDB
Make sure MongoDB is running on your system.

5. Start the server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Access the application
- Main Scorecard: http://localhost:3000
- Login: http://localhost:3000/login.html
- Match Lineup: http://localhost:3000/lineup.html
- Game Control: http://localhost:3000/control.html
- Detailed Scorecard: http://localhost:3000/detail.html

## Default Admin Credentials

- Username: `admin`
- Password: `admin`

## Project Structure

```
cric-live/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── matchController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Match.js
│   │   ├── Team.js
│   │   └── Player.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── match.js
│   │   └── player.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── control.js
│   │   ├── scoreboard.js
│   │   └── utils.js
│   ├── index.html
│   ├── detail.html
│   ├── login.html
│   ├── lineup.html
│   └── control.html
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Match
- `GET /api/match/active` - Get active match
- `GET /api/match/:id` - Get match by ID
- `POST /api/match/create` - Create new match (protected)
- `POST /api/match/:id/start` - Start match (protected)
- `POST /api/match/:id/ball` - Record a ball (protected)
- `POST /api/match/:id/end-innings` - End innings (protected)
- `POST /api/match/:id/end-match` - End match (protected)

### Player
- `POST /api/player/create` - Create player (protected)

## Usage

1. **Login**: Use admin credentials to login
2. **Create Match**: Go to lineup page, configure teams and players, then start match
3. **Control Game**: Use the control page to record balls, wickets, and manage innings
4. **View Score**: Main page shows live score, detail page shows full scorecard

## Cricket Rules Implemented

- Over calculation (6 balls = 1 over)
- Wicket handling with dismissal types
- Extra runs (wides, no-balls)
- Free hit after no-ball
- Striker/non-striker rotation
- Innings switching
- Target calculation (1st innings + 1)

## License

ISC

