const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rotas básicas de teste
app.get('/', (req, res) => {
  res.json({ status: 'Socket.IO server OK' });
});

app.get('/socket.io/', (req, res) => {
  res.json({ status: 'Socket.IO endpoint OK' });
});

// TEMPORARIAMENTE SEM OS TEUS IMPORTS (para isolar o erro)
const connectedDevices = new Map();
const peers = new Map();

// Event listeners básicos
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.emit('welcome', 'Servidor funcionando!');
  
  socket.on('message', (data) => {
    console.log('Mensagem:', data);
    socket.emit('response', `Recebido: ${data}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send('Something went wrong!');
});

// Porta (APENAS AQUI!)
const PORT = 3007;
server.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});


