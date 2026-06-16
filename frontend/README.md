# Co-Ride Frontend

Smart ride-sharing platform frontend for Indian students, built with React, Vite, and Tailwind CSS.

## Features

- User authentication (JWT + Refresh Tokens)
- Student verification with college email/ID
- Trip creation and booking
- Real-time chat (Socket.io)
- Wallet system
- Responsive design

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Redux Toolkit (State Management)
- React Hook Form + Zod
- Socket.io Client

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API services
├── store/          # Zustand stores
├── hooks/          # Custom hooks
├── utils/          # Utility functions
└── App.jsx         # Main app component
```

## License

MIT