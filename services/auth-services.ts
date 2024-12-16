//Generate access token
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
const jwtSettings = require('../constants/jwtSetting')

const repository = AppDataSource.getRepository(User);


const generateAccessToken =   async function generateAccessToken(user: any) {
  const secret = jwtSettings.SECRET;
  const username = user.username;
  const idRole = user.roleId;

  const payload = {
      message: 'success',
      sub: username,
      note: 'pducpro',
      idRole: idRole,
    };
  const token = jwt.sign(payload, jwtSettings.SECRET, {
    expiresIn: '24h', // Token có hiệu lực trong 24 giờ
    audience: jwtSettings.AUDIENCE,
    issuer: jwtSettings.ISSUER,
    algorithm: 'HS512',
    
  });

    // REFRESH TOKEN

  // const found = repository.findOneBy(username);
  const refreshToken = jwt.sign({ sub: username, idRole }, secret, { expiresIn: '365d' });
  return { token, refreshToken };
  
}



//reset access token

const refreshAccessToken = async (refreshToken: any) => {
  if (!refreshToken) {
    return { message: 'No refresh token provided' }; 
  }
  else
    console.log('b1');

  try {
    // Sử dụng Promise để xử lý bất đồng bộ
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, jwtSettings.SECRET, (err: any, decoded: any) => {
        if (err) {
          return reject({ message: 'Refresh token is invalid or expired' });
        }
        resolve(decoded);
        
      }); 
    });
   
    const { sub } = decoded as { sub: string };
    console.log('Decoded:', decoded);
    const user = await repository.findOneBy({ username: sub }); // Xác thực người dùng từ refreshToken

    if (!user) {
      return { message: 'User not found' };
    } else {
      console.log('User found:', user);
    }

    // Tạo access token mới
    const newAccessToken = jwt.sign(
      {
        message: '123123',
        sub: user.username,
        note: 'pducpro',
      },
      jwtSettings.SECRET,
      {
        expiresIn: '1m',
        audience: jwtSettings.AUDIENCE,
        issuer: jwtSettings.ISSUER,
        algorithm: 'HS512',
      }
    );

    return { accessToken: newAccessToken }; // Trả về access token mới
  } catch (error) {
    return { message: 'Internal server error', error }; // Trả về thông báo lỗi
  }
};


export  { generateAccessToken, refreshAccessToken};