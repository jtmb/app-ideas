// Main entry point for the real-time comment system
import express from 'express';
import { createServer } from 'http';
import { Server } from 'ws';
import commentRoutes from './routes/comments';
import CollaborationEventEmitter from './services/collaboration-events';

const app = express();
const httpServer = createServer(app);
const wss = new Server({ server: httpServer });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/comments', commentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

const collaborationEmitter = new CollaborationEventEmitter();

wss.on('connection', (socket) => {
  const userId = socket.handshake.query.userId || 'anonymous';
  collaborationEmitter.connect(userId, socket);
  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Message from ' + userId + ':', message);
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  });
  socket.on('close', () => { collaborationEmitter.disconnect(userId); });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('WebSocket server ready');
});

export default app;