const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws'); // Adicionado para cliente WebSocket

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Armazenamento em memória
const connectedDevices = new Map();
const peers = new Map();

// Cliente WebSocket para TouchDesigner
const tdSocket = new WebSocket('ws://localhost:9980');

tdSocket.on('open', () => {
    console.log('Conectado ao TouchDesigner (porta 9980)');
});

tdSocket.on('message', (data) => {
    console.log('Mensagem do TD:', data.toString());
});

tdSocket.on('error', (error) => {
    console.error('Erro WebSocket TD:', error);
});

tdSocket.on('close', () => {
    console.log('🔌 Desconectado do TouchDesigner');
});

// Função para enviar posição ao TouchDesigner
function enviarPosicao(lat, lng) {
    const msg = JSON.stringify({ lat, lng, type: 'position' });
    if (tdSocket.readyState === WebSocket.OPEN) {
        tdSocket.send(msg);
        console.log('Posição enviada:', { lat, lng });
    } else {
        console.log('WebSocket TD não está conectado');
    }
}

// Setup imports
const setupMiddleware = require('./middleware/middleware');
const setupRoutes = require('./routes/routes');
const setupSockets = require('./sockets/sockets');

// Apply setups
setupMiddleware(app);
setupRoutes(app);
setupSockets(io, connectedDevices, peers, enviarPosicao); // Passa a função

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
});
