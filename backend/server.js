import http from 'http';
import fs from 'fs';
import os from 'os';

const IS_WINDOWS = os.platform() === 'win32';

// Use port on Windows, socket on Linux/Mac
const PORT = 3001;
const SOCKET_PATH = '/tmp/myapp.sock';

const server = http.createServer((req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello!' }));
});

if (IS_WINDOWS) {
  // Windows: Use TCP port
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} else {
  // Linux/Mac: Use Unix socket
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }
  
  server.listen(SOCKET_PATH, () => {
    console.log(`Server listening on ${SOCKET_PATH}`);
    fs.chmodSync(SOCKET_PATH, '660');
  });
}

// Cleanup
process.on('SIGINT', () => {
  server.close();
  if (!IS_WINDOWS && fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }
  process.exit(0);
});