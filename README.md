## Code Structure

The repository is divided into two folders backend and the frontend:

- **`backend/`**: This is the game server and it was built with Node.js, Express, and Socket.io.
  - `index.js`: This serves the frontend assets, sets up the Socket.io server, and manages communication with the code executor.
  - `handle-client.js`: This file manages users connecting to a match, handles joining/leaving rooms, and processes code submissions.
  - `executor-comms.js`: Handles the low-level communication with the code executor service.

- **`frontend/`**: This was built using React and Tailwind.
  - Uses `@monaco-editor/react` for the in-browser code editor.
  - Connects to the backend using websockets `socket.io-client`.

## How to Run

### 1. Start the Code Executor
Before starting the backend, you will need the code executor running.

### 2. Run the Backend
1. Go to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

### 3. Run the Frontend (Development)

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
