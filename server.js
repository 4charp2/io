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

  // Приветствие нового пользователя
  socket.emit('chat message', 'Добро пожаловать в чат!');

  // Обработчик нового сообщения от клиента
  socket.on('chat message', (msg) => {
    console.log('Сообщение: ' + msg);
    
    // Отправляем сообщение обратно клиенту, который его отправил
    socket.emit('chat message', 'Вы: ' + msg);

    // Отправляем сообщение всем остальным клиентам
    socket.broadcast.emit('chat message', 'Пользователь: ' + msg);
  });

  // Обработчик отключения пользователя
  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

// Маршрут для создания чат-сессии
app.get('/chat', (req, res) => {
  // Генерируем уникальный идентификатор сессии
  const sessionId = generateSessionId(); // Функция, которая генерирует уникальный ID

  // Отправляем пользователю HTML с ссылкой для инициализации чата
  const html = `
    <html>
      <head>
        <title>Инициализация чата</title>
      </head>
      <body>
        <h1>Инициализация чата</h1>
        <p>Чтобы начать чат, перейдите по следующей ссылке:</p>
        <p><a href="/start-chat?sessionId=${sessionId}">Начать чат</a></p>
      </body>
    </html>
  `;
  res.send(html);
});

// Маршрут для инициализации чат-сессии
app.get('/start-chat', (req, res) => {
  const sessionId = req.query.sessionId;

  // Отправляем пользователю HTML с кодом для инициализации чата
  const html = `
    <html>
      <head>
        <title>Чат</title>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const socket = io();

            const form = document.getElementById('chatForm');
            const input = document.getElementById('chatInput');
            const messages = document.getElementById('messages');

            form.addEventListener('submit', (e) => {
              e.preventDefault();
              if (input.value) {
                socket.emit('chat message', input.value);
                input.value = '';
              }
            });

            socket.on('chat message', (msg) => {
              const item = document.createElement('li');
              item.textContent = msg;
              messages.appendChild(item);
            });
          });
        </script>
      </head>
      <body>
        <h1>Чат</h1>
        <ul id="messages"></ul>
        <form id="chatForm" action="">
          <input id="chatInput" autocomplete="off">
          <button>Отправить</button>
        </form>
      </body>
    </html>
  `;
  res.send(html);
});

// Запуск сервера
const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Сокет запущен на порту ${PORT}`);
});

// Функция для генерации уникального идентификатора сессии
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}
