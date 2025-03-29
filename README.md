
# Feature Flag Dashboard

A full-stack application for managing feature flags with React and Express.

## Project Structure

- **Frontend**: React application with Vite, Tailwind, and shadcn/ui
- **Backend**: Express API with MongoDB for data storage

## Deployment Instructions

### Backend Deployment (Vercel)

1. Create a new Vercel project and connect it to your repository
2. Set the root directory to `backend`
3. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure string for JWT token generation

### Frontend Deployment (Vercel)

1. Create a new Vercel project and connect it to your repository
2. Set the root directory to the project root (where the frontend files are)
3. Add the following environment variables:
   - `VITE_API_URL`: URL of your deployed backend (e.g., https://your-backend.vercel.app)

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## Features

- User authentication with JWT
- Feature flag management
- Real-time flag toggling
- Responsive UI

