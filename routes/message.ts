import express, { Request, Response } from 'express';
import Message, { IMessage } from '../entities/message.model'; // Đảm bảo đường dẫn tới model chính xác
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entiy';


const Userrespository = AppDataSource.getRepository(User);
const Roomrespository = AppDataSource.getRepository(Room);

// Hàm tiện ích asyncHandler
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

var router = express.Router();


// Get all messages

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const messages = await Message.find();
  res.json(messages);
}));

// Get all message by room id
router.get('/room/:roomId', asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId: roomId });

  res.json(messages);
}
));

//Get all message by user id
router.get('/user/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const messages = await Message.find
    ({ senderId: userId });
  res.json(messages);
}));




// Endpoint: Tạo mới tin nhắn
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  //check if room exist

  const { roomId, senderId, content } = req.body;
  const room = await Roomrespository.findOneBy({ id: roomId });
  const user = await Userrespository.findOneBy({ id: senderId });
  if (!room || !user || !content) {
    return res.status(400).json({ message: 'roomId, senderId, and content are not exists' });
  }

  try {
    const newMessage = new Message({
      roomId,
      senderId,
      content,
      nameUser: user.fullname,
    });

    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint: Cập nhật tin nhắn theo ID
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint: Xoá tin nhắn theo ID
router.delete('/messages/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

//Xoá tin nhắn theo phòng
router.delete('/room/:roomId', asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    await Message
      .deleteMany({ roomId: roomId });
    res.json({ message: 'All messages in room deleted successfully' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));



// Xoá tất cả tin nhắn

router.delete('/all-messages', asyncHandler(async (req: Request, res: Response) => {
  try {
    await Message.deleteMany({}); 
    res.json({ message: 'All messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

module.exports = router;
