import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import asyncHandler from 'express-async-handler';
import { refreshAccessToken } from '../../services/auth-services';
import { allowRoles } from '../../middlewares/checkRole';
import { login } from '../../controllers/authController';

const router = express.Router();

require('dotenv').config();
const { passportVerifyAccount } = require('../../middlewares/passportJwt');

passport.use('localAdmin', passportVerifyAccount);

//POST login with jwt token
router.post('/login', passport.authenticate('localAdmin', { session: false }) , login) ;


  

//Refresh token
router.post('/refresh-token' ,async (req: Request, res: Response) => {

    const  accessToken  = await refreshAccessToken(req.body.refreshToken);
    res.json(accessToken);
    console.log(accessToken);
   
  
  });
  



// forgot password
// router.get('/forgot-password', forgotPassword);
// router.put('/reset-password', resetPassword);
export default router;
