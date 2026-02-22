const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
global.wss = wss;
console.log('WebSocket server running on port 8080');
