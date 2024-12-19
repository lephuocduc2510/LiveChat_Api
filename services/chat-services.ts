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
          // io.to(roomId).emit('server-message', data);  // Chỉ gửi tới phòng với roomId tương ứng
          // Lưu tin nhắn vào database
          const message = new Message({
            roomId: data.roomId,
            content: data.message,
            senderId: data.idUser,
            senderName: data.nameUser,
            timestamp: data.timestamp,
            nameUser: data.nameUser,
            avatar: data.avatar,
            

          });

          // message.save()
          //   .then(() => console.log('Message saved successfully'))
          //   .catch((err: any) => console.error('Failed to save message:', err));
          // console.log('Message:', message);

          // Lưu tin nhắn vào database
          message.save()
            .then(savedMessage => {
              console.log('Message saved successfully:', savedMessage);

              // Thêm _id vào data và gửi lại cho client
              const responseData = {
                ...data,
                _id: savedMessage._id, // Thêm _id vào data
              };

              // Emit lại dữ liệu cho client, bao gồm _id tự động của message
              io.to(roomId).emit('server-message', responseData);
            })
            .catch((err: any) => console.error('Failed to save message:', err));

          console.log('Message:', message);
          break;

        case 'update': // Cập nhật tin nhắn       
          io.to(data.roomId).emit('server-message', data);
          console.log('Message updated:', data._id, data.content, data.roomId);
          // Cập nhật tin nhắn trong database
          // Message.findByIdAndUpdate(data._id, { content: data.content }, { new: true })
          //   .then(() => {
          //     // Gửi lại ID và nội dung tin nhắn đã được cập nhật cho client trong phòng

          //   })
          //   .catch((err) => {
          //     console.error('Error updating message:', err);
          //   });
          break;

         
        case 'delete': // Xóa tin nhắn
        io.to(data.roomId).emit('server-message', data);
        console.log('Message deleted:', data._id);  

          // Xóa tin nhắn khỏi database
          // Message.findByIdAndDelete(data._id)
          //   .then(() => {
          //     // Gửi lại ID của tin nhắn đã bị xóa cho client trong phòng
          //     io.to(data.room).emit('server-message', {
          //       type: 'delete',
          //       _id: data._id,  // Chỉ trả về ID của tin nhắn đã xóa
          //     });
          //   })
          //   .catch((err) => {
          //     console.error('Error deleting message:', err);
          //   });
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
