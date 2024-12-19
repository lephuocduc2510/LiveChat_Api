import express, { Request, Response } from 'express';
const router = express.Router();
import { AppDataSource } from '../data-source';
import { Room } from '../entities/room.entiy';
import { User } from '../entities/user.entity';
import { RoomUser } from '../entities/roomUser.entity';
import passport from 'passport';
import { passportVerifyToken } from '../middlewares/passportJwt';
import Message, { IMessage } from '../entities/message.model';

passport.use('jwt', passportVerifyToken)

const respository = AppDataSource.getRepository(RoomUser);
const respositoryUser = AppDataSource.getRepository(User);
const respositoryRoom = AppDataSource.getRepository(Room);

/* GET rooms listing. */
router.get('/',  passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
    try {
        const rooms = await respository.find();
        if (rooms) {
            res.json(rooms);
        }
        else
            res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors: error });

    }
}
);

// Get room by Id Room
router.get('/:id',  passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
    try {
        const room = await respositoryRoom.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
            res.json(room);
        }
        else
            res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors: error });

    }
}
);

//Get user by Id Room
router.get('/room/:id', passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
    try {
        const users = await respository.find({
            where: { roomId: parseInt(req.params.id) },
            relations: ['user'],  // Tải thông tin người dùng từ bảng User
        });

        if (users && users.length > 0) {
            // Xử lý dữ liệu để trả về đúng format
            const result = users.map(user => ({
                id: user.id,
                roomId: user.roomId,
                userId: user.userId,
                fullname: user.user.fullname,
                username: user.user.username,
                email: user.user.email,
                phoneNumber: user.user.phoneNumber,
                avatar: user.user.avatar,
            }));

            res.json({
                result: result
            });  
        } else {
            res.json({ message: 'No user found for this room' });
        }
    } catch (error) {
        res.json({ message: 'Internal server error', errors: error });
    }
});

// Get room by Id User
router.get('/user/:id', passport.authenticate('jwt', { session: false }),  async function (req: Request, res: Response, next) {
    try {
        // Sử dụng RoomUser để tìm liên kết người dùng
        const rooms = await respository.find({
            where: { userId: parseInt(req.params.id) },
            relations: ['room'],  // Tải thông tin phòng từ bảng Room
        });

        if (rooms && rooms.length > 0) {
            const result = await Promise.all(rooms.map(async room => {
                const lastMessage = await Message.findOne({
                    roomId: room.roomId
                }).sort({ timestamp: -1 });
                 // Nếu có tin nhắn cuối cùng, lấy thông tin người gửi từ bảng User
                 let senderName = null;
                 if (lastMessage && lastMessage.senderId) {
                     const sender = await respositoryUser.findOne({ where: { id: lastMessage.senderId } });
                     senderName = sender ? sender.fullname : null;
                 }

                return {
                    id: room.id,
                    roomId: room.roomId,
                    userId: room.userId,
                    name: room.room.name,
                    groupLogo: room.room.groupLogo,
                    created_at: room.room.created_at,
                    updated_at: room.room.updated_at,
                    lastMessage: lastMessage ? lastMessage.content : null,
                    sendAt: lastMessage ? lastMessage.timestamp : null,
                    senderId: lastMessage ? lastMessage.senderId : null,  // Thêm id người gửi
                    senderName: lastMessage ? lastMessage.nameUser : null,
                };
            }));

            res.json({
                result: result
            });  // Trả về tất cả các phòng người dùng tham gia với thông tin phòng
        } else {
            res.json({ message: 'No room found for this user' });
        }
    } catch (error) {
        res.json({ message: 'Internal server error', errors: error });
    }
});


// Add user to room
router.post('/', passport.authenticate('jwt', { session: false }) , async function (req: Request, res: Response, next) {
    try {
        const { idRoom, idUser } = req.body; // Lấy idRoom và idUser từ body của request

        // Kiểm tra xem user đã có trong room chưa
        for (const id of idUser) {
            const existingUserInRoom = await respository.findOne({
                where: { roomId: idRoom, userId: id },
            });

            if (existingUserInRoom) {
                // Nếu user đã có trong room thì trả về thông báo lỗi
                res.status(400).json({ message: 'User already in room' });
                return;
            }

            const roomUser = new RoomUser();
            roomUser.roomId = idRoom;
            roomUser.userId = id;

            // Lưu RoomUser vào cơ sở dữ liệu
            await respository.save(roomUser);
        }

        // Lấy thông tin room và users sau khi thêm
        const room = await respositoryRoom.findOne({
            where: { id: idRoom },
            relations: ['roomUsers'], // Đảm bảo lấy cả quan hệ với RoomUser
        });
        const users = await respositoryUser.findByIds(idUser); // Lấy tất cả user đã được thêm vào

        // Trả về thông tin phòng và người dùng
        res.json({ message: 'Room users added successfully!', room, users });
    } catch (error) {
        // Nếu có lỗi xảy ra, trả về lỗi 500
        res.status(500).json({ message: 'Internal server error', errors: error });
    }
});




// Update role by Id

router.patch('/:id',  passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
            respository.merge(room, req.body);
            const result = await respository.save(room);
            res.json(result);
        }
        else
            res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors: error });

    }
}
);

//Delete user to room
router.delete('/',  passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
    try {
        const idRoom = req.body.idRoom;
        const idUser = req.body.idUser;

        // Kiểm tra xem user có tồn tại trong room không
        for (const id of idUser) {
            const existingUserInRoom = await respository.findOne({
                where: { roomId: idRoom, userId: id }
            });

            if (!existingUserInRoom) {
                // Nếu người dùng không tồn tại trong phòng, trả về thông báo lỗi
                res.status(400).json({ message: 'User not found in room' });
                return;
            }

            // Nếu user tồn tại trong room, thực hiện xóa
            await respository.remove(existingUserInRoom);
        }

        // Trả về thông tin của room và users còn lại trong room
        const room = await respositoryRoom.findOneBy({ id: idRoom });
        const usersInRoom = await respository
        .createQueryBuilder('roomUser') // Alias 'roomUser' là đối tượng RoomUser
        .innerJoinAndSelect('roomUser.user', 'user') // 'user' phải tồn tại trong RoomUser
        .where('roomUser.roomId = :roomId', { roomId: idRoom }) // Truy vấn đúng trường roomId
        .getMany();

        res.json({ message: 'Room users removed successfully!', room, usersInRoom });
    } catch (error) {
        // trả về lỗi rõ ràng
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';

        console.error('Error during delete operation:', error);

        res.status(500).json({
            message: 'Internal server error',
            errors: errorMessage
        });
    }
});






module.exports = router;
