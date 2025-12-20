# FetchFriends.dev

**Tagline:** `fetch(your next coding companion).then(pairProgram)`

A VS Code-inspired developer video networking platform where verified developers connect, pair program, and collaborate in real-time.

## 🚀 Features

- 🎨 **VS Code-Inspired UI**: Familiar interface that feels like home
- 🔐 **Multi-Auth Verification**: GitHub + LinkedIn OAuth with smart verification scoring
- 🎥 **WebRTC Video Calls**: Real-time video collaboration with screen sharing
- 💻 **Monaco Editor**: Full VS Code editor in browser with live collaboration
- 🖥️ **Terminal**: Integrated terminal emulator with shared commands
- 💬 **Chat & Whiteboard**: Real-time messaging and collaborative whiteboard
- 🔍 **Smart Matching**: Three matching modes (random, skill-based, goal-based)
- ⌨️ **Command Palette**: VS Code-style command palette (Ctrl+Shift+P)
- 🎯 **Activity Bar**: VS Code-style sidebar navigation
- 📊 **Reputation System**: Gamification with badges and levels

## 🏗️ Architecture

### Frontend (Next.js 14)
- React Server Components
- TypeScript
- Tailwind CSS
- Monaco Editor
- Socket.io Client
- Zustand (state management)

### Backend (Express + Node.js)
- Express.js REST API
- Socket.io for real-time
- MongoDB with Mongoose
- Redis for queues
- Passport.js OAuth
- JWT authentication

## 📦 Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Run development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
   - MongoDB URI
   - Redis URL
   - GitHub OAuth credentials
   - LinkedIn OAuth credentials
   - JWT secret

5. Run backend server:
```bash
npm run dev
```

## 🔑 OAuth Setup

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:4000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### LinkedIn OAuth
1. Go to LinkedIn Developers → My Apps
2. Create new app
3. Add redirect URL: `http://localhost:4000/api/auth/linkedin/callback`
4. Request `r_liteprofile` and `r_emailaddress` scopes
5. Copy Client ID and Client Secret to `.env`

## 🎮 Usage

1. **Sign Up**: Use GitHub or LinkedIn to authenticate
2. **Verification**: System automatically verifies your profile
3. **Search**: Use the search console to find developers
4. **Match**: Join queue and get matched
5. **Collaborate**: Video call + code editor + terminal + chat
6. **Rate**: Leave feedback after sessions

## ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+P` - Open Command Palette
- `Ctrl+B` - Toggle Sidebar
- `Ctrl+\` - Split View (coming soon)
- `Ctrl+Enter` - Send chat message

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Auth callback pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── backend/               # Express backend
│   ├── src/
│   │   ├── config/       # Database, Redis config
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── socket/       # Socket.io handlers
│   │   └── middleware/   # Auth, error handling
│   └── package.json
├── components/            # React components
│   ├── auth/             # Authentication UI
│   ├── editor/           # Code editor
│   ├── matching/         # Matching/search UI
│   ├── video/            # Video call
│   ├── terminal/         # Terminal
│   ├── chat/             # Chat
│   ├── vscode/           # VS Code UI components
│   └── ui/               # Shared UI components
└── lib/                  # Utilities
    ├── api/              # API client
    └── socket/           # Socket client
```

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/github` - Start GitHub OAuth
- `GET /api/auth/linkedin` - Start LinkedIn OAuth
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify/status` - Verification status

### Matching
- `POST /api/match/join` - Join queue
- `DELETE /api/match/leave` - Leave queue
- `GET /api/match/status` - Queue status
- `POST /api/match/accept/:sessionId` - Accept match

### Sessions
- `GET /api/sessions/:id` - Get session
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/leave` - Leave session

See `backend/README.md` for complete API documentation.

## 🎨 VS Code Theme

The app uses VS Code's dark theme color palette:
- Background: `#1e1e1e`
- Sidebar: `#252526`
- Accent: `#007acc` (VS Code blue)
- Text: `#cccccc`
- Secondary Text: `#858585`

## 🧪 Development

### Running Both Servers

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

### Testing

Backend tests:
```bash
cd backend
npm test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

Built with ❤️ for developers who love to code together.
