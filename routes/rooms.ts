import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { Room } from '../entities/room.entiy';
import { User } from '../entities/user.entity';
import passport from 'passport';
import { passportVerifyToken } from '../middlewares/passportJwt';
import multer from 'multer';
import path from 'path';
import { allowRoles } from '../middlewares/checkRole';


passport.use('jwt', passportVerifyToken);
const router = express.Router();
const respository = AppDataSource.getRepository(Room);
const respositoryUser = AppDataSource.getRepository(User);

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logoGroup'); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Tạo tên file duy nhất
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép các định dạng ảnh (jpeg, jpg, png, gif)'));
    }
  },
});


/* GET rooms listing. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req: Request, res: Response, next) {
    try {
        const rooms = await respository.find();
        if (rooms) {
        res.json(rooms);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Get room by Id
router.get('/:id', passport.authenticate('jwt', { session: false }) ,async function(req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
        res.json(room);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);


// Get room by id user

router.get('/user/:id', passport.authenticate('jwt', { session: false }), async function(req: Request, res: Response, next) {
    try {
        const rooms = await respositoryUser.findOneBy({ id: parseInt(req.params.id) });
        if (rooms) {
        res.json(rooms);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);



// Create new room

router.post('/', passport.authenticate('jwt', { session: false }),allowRoles('Mod', "Admin"),  async function(req: Request, res: Response, next) {
    try {
        const room = new Room();
        respository.merge(room, req.body);
        const result = await respository.save(room);
        res.json(result);
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Update room

router.patch('/:id', passport.authenticate('jwt', { session: false }),allowRoles('Mod', "Admin") ,async function(req: Request, res: Response, next) {
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
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

//Delete room by Id
router.delete('/:id', passport.authenticate('jwt', { session: false }),allowRoles('Mod', "Admin"), async function(req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
        const result = await respository.remove(room);
        res.json(result);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// API upload group avatar
router.post('/upload-logo/:roomId', upload.single('logo'),allowRoles('Mod', "Admin"), (req: Request, res: Response) => {
  (async () => {
    const roomId = parseInt(req.params.roomId);
    const roomRepository = AppDataSource.getRepository(Room);

    try {
      // Kiểm tra nếu user tồn tại
      const room = await roomRepository.findOneBy({ id: roomId });
      if (!room) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      // Kiểm tra nếu không có file
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên một file ảnh' });
      }

      // Cập nhật đường dẫn avatar trong cơ sở dữ liệu
      room.groupLogo = `${process.env.SERVER_URL}/uploads/logoGroup/${req.file.filename}`;
      await roomRepository.save(room);

      return res.status(200).json({ message: 'Cập nhật avatar thành công', groupLogo: room.groupLogo });
    } catch (error) {
      console.error('Lỗi khi upload avatar:', error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình upload avatar' });
    }
  })();
});

module.exports = router;
