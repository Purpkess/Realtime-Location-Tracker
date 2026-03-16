const express = require('express');
const https = require('https'); // Mudança: https em vez de http
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();

// Carregar certificados SSL (obrigatório para porta 443)
const privateKey = fs.readFileSync('/path/to/private-key.pem', 'utf8');
const certificate = fs.readFileSync('/path/to/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app); // Mudança: https.createServer
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    // Configuração para HTTPS
    secure: true,
    transports: ['websocket'] // Força WebSocket (sem polling)
});

// In-memory storage
const connectedDevices = new Map();
const peers = new Map();

// Setup imports
const setupMiddleware = require('./middleware/middleware');
const setupRoutes = require('./routes/routes');
const setupSockets = require('./sockets/sockets');

// Apply setups
setupMiddleware(app);
setupRoutes(app);
setupSockets(io, connectedDevices, peers);

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server na porta 443
const PORT = process.env.PORT || 443;
server.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' para acesso externo
    console.log(`Server HTTPS + WebSocket rodando na porta ${PORT}`);
});

