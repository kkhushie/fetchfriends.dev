# FetchFriends Backend

Express.js backend server for FetchFriends platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials

4. Start MongoDB and Redis:
```bash
# MongoDB (if running locally)
mongod

# Redis (if running locally)
redis-server
```

5. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/github` - Start GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/linkedin` - Start LinkedIn OAuth
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify/status` - Get verification status

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search` - Search users
- `POST /api/users/availability` - Update availability
- `GET /api/users/:id/stats` - Get user stats
- `PUT /api/users/settings` - Update settings

### Matching
- `POST /api/match/join` - Join matching queue
- `DELETE /api/match/leave` - Leave queue
- `GET /api/match/status` - Get queue status
- `POST /api/match/accept/:sessionId` - Accept match
- `POST /api/match/decline/:sessionId` - Decline match
- `GET /api/match/history` - Get match history

### Sessions
- `GET /api/sessions/:id` - Get session
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/leave` - Leave session
- `POST /api/sessions/:id/extend` - Extend session
- `GET /api/sessions/history` - Get session history

### Feedback
- `POST /api/feedback/:sessionId` - Submit feedback
- `GET /api/feedback/received` - Get received feedback
- `GET /api/feedback/given` - Get given feedback

## Socket.IO Events

### Client → Server
- `user:online` - Mark user as online
- `session:join` - Join a session room
- `session:leave` - Leave a session room
- `code:change` - Code editor change
- `code:save` - Save code file
- `terminal:command` - Terminal command
- `terminal:output` - Terminal output
- `whiteboard:draw` - Whiteboard drawing
- `whiteboard:clear` - Clear whiteboard
- `chat:message` - Send chat message
- `chat:typing` - Typing indicator
- `webrtc:offer` - WebRTC offer
- `webrtc:answer` - WebRTC answer
- `webrtc:ice-candidate` - ICE candidate
- `queue:subscribe` - Subscribe to queue updates
- `queue:unsubscribe` - Unsubscribe from queue

### Server → Client
- `session:user-joined` - User joined session
- `session:user-left` - User left session
- `code:change` - Code change from other user
- `code:save` - Code save from other user
- `terminal:command` - Terminal command from other user
- `terminal:output` - Terminal output from other user
- `whiteboard:draw` - Whiteboard drawing from other user
- `whiteboard:clear` - Whiteboard cleared
- `chat:message` - Chat message from other user
- `chat:typing` - Typing indicator from other user
- `webrtc:offer` - WebRTC offer from other user
- `webrtc:answer` - WebRTC answer from other user
- `webrtc:ice-candidate` - ICE candidate from other user
- `user:status` - User status update
- `error` - Error message

## Development

The server uses TypeScript and runs with `tsx` for hot reloading in development.

## Production

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

