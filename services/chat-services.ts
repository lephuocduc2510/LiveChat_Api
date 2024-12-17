import { Server } from "socket.io";
import Message from "../entities/message.model";

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
          // Duyệt qua các phòng và join vào từng phòng
          data.rooms.forEach((room: any) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);

            // Emit thông tin cho những người dùng khác trong phòng
            io.to(room).emit('server-message', {
              message: `User ${data.name} has joined the room: ${room}`,
              userId: data.userId,
              name: data.name,
              rooms: data.rooms,
            });
          });
          break;

        case 'chat':
          const roomId = data.roomId;  // Lấy roomId từ dữ liệu gửi tới

          // Gửi tin nhắn tới phòng cụ thể
          io.to(roomId).emit('server-message', data);  // Chỉ gửi tới phòng với roomId tương ứng
          // Lưu tin nhắn vào database
          const message = new Message({
            roomId: data.roomId,
            content: data.message,
            senderId: data.idUser,
            timestamp: data.timestamp,
            nameUser: data.nameUser,
            avatar: data.avatar,

          });

          message.save()
            .then(() => console.log('Message saved successfully'))
            .catch((err: any) => console.error('Failed to save message:', err));
          console.log('Message:', message);
          break;

    
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
