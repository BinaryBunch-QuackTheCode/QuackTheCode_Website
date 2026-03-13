## Code Structure

The repository is divided into two folders backend and the frontend:

- **`backend/`**: The server-side application built with Node.js, Express, and Socket.io.
  - `index.js`: The main entry point for the server. It serves the frontend assets, sets up the Socket.io server, and manages communication with a separate code executor via a local Unix socket (`/tmp/executor.sock`).
  - `handle-client.js`: Manages individual client connections, handles joining/leaving rooms, and processes code submissions.
  - `executor-comms.js`: Handles the low-level communication with the code executor service.
  - `db/`: Contains the database setup files.
    - `schema.sql`: The MySQL database schema for storing coding questions.
    - `seed.sql`: Seed data containing sample LeetCode-style questions.
  - `leetcode.js` & `game-utils.js`: Hardcoded problem data and utility functions while the database integration is being finalized.

- **`frontend/`**: The client-side React application built using Vite and TailwindCSS.
  - Uses `@monaco-editor/react` for the in-browser code editor.
  - Connects to the backend via `socket.io-client`.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **MySQL**: (Optional, if you are running the DB directly instead of using hardcoded problems)
- **Code Executor Service**: The backend expects a local socket `/tmp/executor.sock` to be available to execute Python code safely.

## How to Run

### 1. Start the Code Executor
Before starting the backend, make sure the external code execution engine is running and bound to `/tmp/executor.sock`.

### 2. Run the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

### 3. Run the Frontend (Development)
The backend can serve the compiled frontend from `frontend/dist`, but during development you will want to run the Vite dev server.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```