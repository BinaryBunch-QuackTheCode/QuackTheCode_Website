import { io } from "socket.io-client";

const socket = io('http://localhost:3000', {
    autoConnect: false // Doesn't connect automatically when the page loads
}); //this connects us to our server

export default socket