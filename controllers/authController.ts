import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword, hashPassword } from '../helpers.ts/auth';
import { generateAccessToken } from '../services/auth-services';
import sendVerifyEmail from '../services/email-services';
import asyncHandler from 'express-async-handler';

const Message = require('../entities/message.model');
const repository = AppDataSource.getRepository(User);


// Register user

const registerUser = async (req: Request, res: Response) => {

    try {
        const email = req.body.email;
        const { password } = req.body;
        const hastPassword = await hashPassword(password);
        // Tạo đối tượng người dùng với mật khẩu đã băm
        const user = repository.create({
            ...req.body,
            password: hastPassword,
        });
        const savedUser = await repository.save(user);
        const newUser = await repository.findOneBy({ email });



        if (savedUser) 
           if (newUser) {
            console.log(newUser.id, newUser.email);
            sendVerifyEmail(newUser.id, newUser.email, res);
            }           
        else
            res.json({ message: 'No user found' });
    } catch (error) {
        console.error("Error occurred during user creation:", error);
        res.status(500).json({ message: 'Internal server error', errors: error });
    }

}



//Login user

const login = asyncHandler(async (req: any, res: any, next: any) => {
    try {
        const user = req.user as User;

        if(!user){
            return res.status(400).json({ message: 'No user found' });
        }  

        
        const username = user.username;
     
        const findUser = await repository.findOneBy({ username });
        if (findUser) {
                 
                const token = await generateAccessToken(user);
                const accessToken = token.token;
                const refreshToken = token.refreshToken;
                res.json({ accessToken  , refreshToken, findUser });
                
        
        } else {
            res.status(400).json({ message: 'No user found' });
        }
    } catch (error) {
        console.error("Error occurred during user creation:", error);
        res.status(500).json({ message: 'Internal server error', errors: error });

    }
  });



const saveMessage = async (roomId: any, senderId: any, content: any) => {
    try {
      const message = new Message({ roomId, senderId, content });
      await message.save();
      console.log('Message saved');
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }



export { registerUser, login }