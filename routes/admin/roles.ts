import express, { Request, Response, NextFunction  } from 'express';
const router = express.Router();
import { AppDataSource } from '../../data-source'; 
import { User } from '../../entities/user.entity';
import { hashPassword } from '../../helpers.ts/auth';
import { allowRoles } from '../../middlewares/checkRole';
import passport from 'passport';
import { passportVerifyToken } from '../../middlewares/passportJwt';  
import { verify } from 'jsonwebtoken';

passport.use('jwt', passportVerifyToken);


const repository = AppDataSource.getRepository(User);


// Check roles

router.get('/check-login', passport.authenticate('jwt', { session: false }) ,allowRoles('Admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!', user: req.user });
});
  


/* GET users listing. */
router.get('/', async function(req: Request, res: Response, next) {
  try {
    const users = await repository.find();
    if (users.length > 0) {
      res.json(users);
    }
    else
    res.json({ message: 'No user found' });
  } catch (error) {
    
    res.json({ message: 'Internal server error', errors : error });
    
  }
});
 
// Get user by Id

router.get('/:id', async function(req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      res.json(user);
    }
    else
    res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors : error });
    
  }
});

// Get user by username

router.get('/username/:username', async function(req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ username: req.params.username });
    if (user) {
      res.json(user);
    }
    else
    res.status(400).json({ message: 'No user found' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', errors : error });
    
  }
});


// Create new user

router.post('/',  async function (req: Request, res: Response, next) {
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

router.patch('/:id', async function(req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) 
      {
        if(req.body.password)
      {
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
    res.json({ message: 'Internal server error', errors : error });
    
  }
});


// Delete user by Id

router.delete('/:id', async function(req: Request, res: Response, next) {
  try {
    const user = await repository.findOneBy({ id: parseInt(req.params.id) });
    if (user) {
      const result = await repository.remove(user);
      res.json(result);
    }
    else
    res.json({ message: 'No user found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors : error });
    
  }
});






export default router;
