import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/user.entity';
import { hashPassword } from '../../helpers.ts/auth';
import passport from 'passport';
import { passportVerifyToken } from '../../middlewares/passportJwt';
import { allowRoles } from '../../middlewares/checkRole';
import multer from 'multer';
import path from 'path';

const router = express.Router();

passport.use('jwt', passportVerifyToken);


const repository = AppDataSource.getRepository(User);


// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars'); // Thư mục lưu trữ file
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


// check verify token

router.get('/verify', passport.authenticate('jwt', { session: false }), async function (req: Request, res: Response, next) {
  res.json(req.user);
});

/* GET users listing. */
router.get('/',async function (req: Request, res: Response, next) {
  try {
    const users = await repository.find();
    if (users.length > 0) {
      res.json(users);
    }
    else
      res.json({ message: 'No user found' });
  } catch (error) {

    res.json({ message: 'Internal server error', errors: error });

  }
});

// Get user by Id

router.get('/:id', async function (req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      res.json(user);
    }
    else
      res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors: error });

  }
});

// Get user by username

router.get('/username/:username', async function (req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ username: req.params.username });
    if (user) {
      res.json(user);
    }
    else
      res.status(400).json({ message: 'No user found' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', errors: error });

  }
});


// Create new user

router.post('/', async function (req: Request, res: Response, next) {
  try {
    // Băm mật khẩu
    const password = req.body.password;
    const hashedPassword = await hashPassword(password);


    // Tạo đối tượng người dùng với mật khẩu đã băm
    const user = repository.create({
      ...req.body,
      password: hashedPassword, // Thay thế mật khẩu bằng mật khẩu đã băm
    });


    // Lưu người dùng vào cơ sở dữ liệu
    const savedUser = await repository.save(user);



    if (savedUser) {
      res.json(savedUser);
    }
    else

      res.json({ message: 'No user found' });

  } catch (error) {
    console.error("Error occurred during user creation:", error);
    res.status(500).json({ message: 'Internal server error', errors: error });
  }
});


// Update user by Id

router.patch('/:id', async function (req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      if (req.body.password) {
        const password = req.body.password;
        const hashedPassword = await hashPassword(password);
        req.body.password = hashedPassword;
      }

      req.body.updated_at = new Date();
      repository.merge(user, req.body);
      const result = await repository.save(user);
      res.json(result);
    }
    else
      res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors: error });

  }
});


// Delete user by Id

router.delete('/:id', async function (req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      const result = await repository.remove(user);
      res.json(result);
    }
    else
      res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors: error });

  }
});

//Get name user by id

router.get('/name/:id', async function (req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      res.json(user.fullname);
    }
    else
      res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors: error });

  }
});

// API check user

router.get('/check', passport.authenticate('jwt', { session: false }), allowRoles('Admin', 'Mod', 'User'),async (req: Request, res: Response, next: any) => {
  // trả về user
  res.json(req.user);
}); 

router.post('/check-user2', passport.authenticate('jwt', { session: false }), allowRoles('Admin', 'Mod', 'User'),async (req: Request, res: Response, next: any) => {
  // trả về user
  res.json(req.user);
});



// API upload avatar
router.post('/upload-avatar/:userId', upload.single('avatar'), (req: Request, res: Response) => {
  (async () => {
    const userId = parseInt(req.params.userId);
    const userRepository = AppDataSource.getRepository(User);

    try {
      // Kiểm tra nếu user tồn tại
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      // Kiểm tra nếu không có file
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên một file ảnh' });
      }

      // Cập nhật đường dẫn avatar trong cơ sở dữ liệu
      user.avatar = `${process.env.SERVER_URL}/uploads/avatars/${req.file.filename}`;
      await userRepository.save(user);

      return res.status(200).json({ message: 'Cập nhật avatar thành công', avatar: user.avatar });
    } catch (error) {
      console.error('Lỗi khi upload avatar:', error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình upload avatar' });
    }
  })();
});


// API change profile
router.put('/change-profile/:userId', async (req: Request, res: Response, next: NextFunction) => {
  (async () => {
  try {
    const userId = parseInt(req.params.userId);
    const { fullName, email, phoneNumber } = req.body;

    // Kiểm tra nếu user tồn tại
    const user = await repository.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
    } else {
      // Cập nhật thông tin người dùng
      if (fullName) user.fullname = fullName;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      await repository.save(user);
      res.status(200).json({ message: 'Cập nhật thông tin thành công', user });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình cập nhật thông tin' });
  }
})();
});


export default router;
