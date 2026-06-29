// WebSocket handler for real-time collaboration events
const { Server } = require('ws');
const EventEmitter = require('events');

class CollaborationEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // userId -> Set of ws connections
  }

  connect(userId, socket) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(socket);
    socket.on('close', () => {
      this.connections.get(userId)?.delete(socket);
      if (this.connections.get(userId)?.size === 0) {
        this.connections.delete(userId);
      }
    });
    this.emit('connection', { userId, socket });
  }

  disconnect(userId) {
    const connections = this.connections.get(userId);
    if (connections) {
      for (const socket of connections) {
        socket.close();
      }
      this.connections.delete(userId);
      this.emit('disconnection', { userId });
    }
  }

  broadcast(eventType, data, excludeUserId = null) {
    const message = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
    for (const [userId, connections] of this.connections.entries()) {
      if (excludeUserId && userId === excludeUserId) continue;
      for (const socket of connections) {
        try {
          socket.send(message);
        } catch (err) {
          console.error('Failed to broadcast:', err.message);
        }
      }
    }
  }

  sendToUser(userId, eventType, data) {
    const message = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
    const connections = this.connections.get(userId);
    if (connections) {
      for (const socket of connections) {
        try {
          socket.send(message);
        } catch (err) {
          console.error('Failed to send to user:', err.message);
        }
      }
    }
  }
}

module.exports = CollaborationEventEmitter;