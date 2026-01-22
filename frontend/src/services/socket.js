import { io } from "socket.io-client";

// Use the current page's origin in production, localhost in development
const SERVER_URL = import.meta.env.DEV 
    ? 'http://localhost:3000' 
    : window.location.origin;

const socket = io(SERVER_URL, {
    autoConnect: false // Doesn't connect automatically when the page loads
}); //this connects us to our server

export default socket