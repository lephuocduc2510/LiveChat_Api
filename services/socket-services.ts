import { Server } from "socket.io";

export const setupChatService = (server: any): Server => {
  // Khởi tạo server socket.io
  const io = new Server(server, {
    cors: {
      origin: true, // Cho phép mọi nguồn (có thể tùy chỉnh để bảo mật hơn)
      credentials: true, // Cho phép gửi cookie nếu cần
    },
  });

  // Cấu hình các sự kiện trong Socket.IO
  io.on('connection', (socket) => {
    console.log('SOCKET IS CONNECTED:', socket.id);

    // Xử lý sự kiện từ client
    socket.on('client-message', (data) => {
      console.log('🚀 Received data:', data);
      switch (data.type) {
        case 'join':
          // Xử lý tham gia phòng
          socket.join(data.room); // Thêm socket vào phòng
          io.to(data.room).emit('server-message', { message: 'Join room is successful' });
          console.log(`Socket ${socket.id} joined room: ${data.room}`);
          break;

        case 'chat':
          // Xử lý gửi tin nhắn trong phòng
          io.to(data.room).emit('server-message', {
            user: data.user,
            message: data.message,
          });
          break;

        case 'quiz-question':
        case 'quiz-answer':
          // Xử lý các loại dữ liệu đặc biệt khác
          io.emit('server-message', data);
          break;

        default:
          console.warn('Unknown message type:', data.type);
          break;
      }
    });

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      io.emit('user disconnected', { socketId: socket.id });
    });
  });

  return io; // Trả về instance của Socket.IO server
};
