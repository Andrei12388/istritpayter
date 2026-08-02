// server.js
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Serve public folder (your HTML, JS, CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
const wss = new WebSocketServer({ server });

// Keep track of clients
let clients = new Set();

wss.on('connection', (ws) => {
  console.log('Player connected');
  clients.add(ws);

  ws.on('message', (msg) => {
    console.log('Received:', msg.toString());

    // Broadcast to all other clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(msg.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Player disconnected');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('Socket error', err);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});