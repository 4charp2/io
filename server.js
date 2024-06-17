const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Ручка для отдачи статических файлов (если нужно)
app.use(express.static(__dirname + '/public'));

// Обработка подключений через Socket.IO
io.on('connection', (socket) => {
  console.log('Пользователь подключился');

  // Обработчик нового сообщения от клиента
  socket.on('chat message', (msg) => {
    console.log('Сообщение: ' + msg);
    // Отправляем сообщение обратно всем клиентам
    io.emit('chat message', msg);
  });

  // Обработчик отключения пользователя
  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Сокет запущен на порту ${PORT}`);
});
