import { Router, Request, Response, NextFunction } from 'express';
import passport, { session } from 'passport';
import { refreshAccessToken } from '../services/auth-services';
import { allowRoles } from '../middlewares/checkRole';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../data-source';
import { UserVerification } from '../entities/userVerification.entiy';
import { User } from '../entities/user.entity';
import { passportVerifyAccount } from '../middlewares/passportJwt';
import { passportVerifyToken } from '../middlewares/passportJwt';
import { login, registerUser } from '../controllers/authController';


const repository = AppDataSource.getRepository(UserVerification);
const repositoryUser = AppDataSource.getRepository(User);
passport.use('login', passportVerifyAccount);
passport.use('jwt', passportVerifyToken);
const router = Router();




// ------------------------------------------------------------------------------------------------

router.get('/me', passport.authenticate('login', { session: false }), async (req: Request, res: Response, next: any) => {
  res.json(req.user);
}
);


// ----------------- Refreshtoken -----------------

router.post('/refresh-token' ,async (req: Request, res: Response) => {

  const  accessToken  = await refreshAccessToken(req.body.refreshToken);
  res.json(accessToken);
  console.log(accessToken);
 

});

  
// ------------------------------------------------------------------------------------------------
// CALL API JWT AUTHENTICATION & CHECK ROLES
// ------------------------------------------------------------------------------------------------

router.get('/admin', passport.authenticate('login', { session: false }), allowRoles('Admin'), function (req, res, next) {
  res.json({ ok: true });
});

router.get('/roles', passport.authenticate('login', { session: false }),  allowRoles('Nomal User', 'Moderate User', "Admin"), function (req, res, next) {
  res.json({ ok: true }); 
});





// ------------------------------------------------------------------------------------------------
// Send verify email
// ------------------------------------------------------------------------------------------------

router.get('/verify-email/:userId/:unique', async (req: any, res: any) => {
  try {
    const { userId, unique } = req.params;

    // Truy vấn từ bảng UserVerification
    const verificationEntry = await repository.findOneBy({ userId: parseInt(userId) });
    
    if (!verificationEntry) {
      return res.status(404).json({ message: 'Verification entry not found' });
    }
    const expire_at = new Date(verificationEntry.expireAt).getTime();
    if (Date.now() > expire_at) {
      // Chỉ xoá bản ghi hết hạn này;
      await repository.delete(verificationEntry);
      return res.status(400).json({ message: 'Link has expired. Please sign up again' });
    }

    const isMatched = await bcrypt.compare(unique, verificationEntry.uniqueString);
    if (isMatched) {
      // Cập nhật trạng thái người dùng
      await repository.save(verificationEntry);
      // cập nhật verify email
      await repositoryUser.update(verificationEntry.userId, { is_verified: true });
      res.json({ message: 'Email verified' });
    } else {
      res.status(400).json({ message: 'Invalid verification link' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// ------------------------------------------------------------------------------------------------

router.post('/login', passport.authenticate('login', { session: false }), login);
router.post('/register', registerUser);

// ------------------------------------------------------------------------------------------------
// Login with admin
// ------------------------------------------------------------------------------------------------












  module.exports = router;