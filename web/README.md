# GYMFU Web Application

React + TypeScript + Vite web application for GYMFU.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Features

- ✅ React 18 with TypeScript
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Vite for fast development
- ✅ Proxy configuration for backend API

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The app is configured to proxy API requests to the backend:
- Backend API: http://localhost:3000
- Web App: http://localhost:5173
- API calls to `/api/*` are proxied to the backend

## Project Structure

```
web/
├── src/
│   ├── pages/          # Page components
│   │   └── HomePage.tsx
│   ├── App.tsx         # Main app component with routing
│   ├── App.css         # App styles
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── .env                # Environment variables
└── vite.config.ts      # Vite configuration
```

## Testing

1. Make sure the backend is running on http://localhost:3000
2. Start the web app: `npm run dev`
3. Open http://localhost:5173 in your browser
4. You should see the GYMFU homepage with backend status

## Next Steps

- Add user authentication pages
- Add gym discovery page
- Add booking flow
- Add marketplace
- Add AI coach interface
