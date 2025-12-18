# School Club Activity Showcase

> A web platform for managing and exploring school club activities, events, and memberships.

**Team 9**: Francesco Bolner, Georgi Bozhkov, Samuele Fumagalli, Ayoub Merdan, Martin Ushilov

## Overview

School Club Activity Showcase is a full-stack web application that enables students to discover, join, and participate in school clubs. The platform provides different access levels based on user roles:

| Role | Description |
|------|-------------|
| **Student** | Browse clubs, enroll as member, leave comments and ratings |
| **Member** | Participate in club events and activities |
| **Vice-President** | Assist with club management and event creation |
| **Leader** | Full club administration, member management, event approval |

### Key Features

- 🔍 **Club Discovery** - Search and browse all available clubs
- 📅 **Event Management** - View upcoming events with calendar export (ICS)
- 👥 **Membership System** - Join clubs and track your memberships
- 💬 **Comments & Ratings** - Share experiences and rate clubs
- 🔔 **Notifications** - Stay updated on club activities
- 🛡️ **Role-Based Access** - Different permissions for students, members, VPs, and leaders

## Tech Stack

- **Frontend**: React 19 + Vite + React Query
- **Backend**: Express.js (Node.js)
- **Database**: MySQL

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Software-Engineering-1-Project
   ```

2. **Setup the database**
   ```bash
   mysql -u root -p < SchoolClubActivity.sql
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```

## Testing

This project includes comprehensive unit testing for both backend and frontend.

### Backend Tests (Jest)

The backend uses **Jest** as the testing framework with 62 unit tests covering utility functions.

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Tested modules:**
- `toNumber` - Number conversion with fallback
- `buildPagination` - Query pagination builder
- `isValidEmail` - Email validation
- `isValidUsername` - Username validation
- `validatePassword` - Password strength validation
- `isValidRole` - Role validation (STU, CM, VP, CL, ADM)
- `sanitizeString` - String sanitization
- `calculatePages` - Page calculation

### Frontend Tests (Vitest + React Testing Library)

The frontend uses **Vitest** (integrated with Vite) and **React Testing Library** with 34 unit tests.

```bash
cd client

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

**Test coverage:**
- `auth.js` - Session management (saveSession, getSession, clearSession, authHeaders)
- `api.js` - API error handling
- `Home.jsx` - Date formatting, ICS generation, event filtering
- Component integration tests - Navigation, forms, pagination, cards

### Test Summary

| Area     | Framework              | Tests |
|----------|------------------------|-------|
| Backend  | Jest                   | 62    |
| Frontend | Vitest + RTL           | 34    |
| **Total**|                        | **96**|








