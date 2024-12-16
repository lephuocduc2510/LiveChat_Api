
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';
import { comparePassword } from '../helpers.ts/auth';
const jwtSettings = require('../constants/jwtSetting')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;


const repository = AppDataSource.getRepository(User);


const passportVerifyToken = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: jwtSettings.SECRET,
    audience: jwtSettings.AUDIENCE,
    issuer: jwtSettings.ISSUER,
  },
  async (payload: any, done: any) => {
    try {
      
      const username = payload.sub;
      const idRole = payload.idRole;
      console.log('Username, roleId from payload:', username, idRole) ;
      
      const user = await repository.findOneBy({ username }); 
      if (!user) {
        return done(null, false);
      }
      return done(null, user); 
    } catch (error) {
      done(error, false); 
    }
  }
);


// Passport Accont

const passportVerifyAccount = new LocalStrategy(
  {
    usernameField: 'username',
  },
  async (username: string, passwordInput: string, done: any) => {
    try {
      // Tìm người dùng trong cả hai repositories
      let user: any = await repository.findOneBy({ username: username });
     
      if (!user) {
        return done(null, false, { message: 'User not found' }); // Không tìm thấy người dùng
      }

      // Validate password using the user object's method
      const isPasswordMatched = await comparePassword(passwordInput, user.password);
      if (!isPasswordMatched) {
        console.log('Password not matched');
        return done(null, false, { message: 'Incorrect password' }); // Mật khẩu không chính xác
      }

      const { password, ...userWithoutPassword } = user;
      // Người dùng xác thực thành công
      console.log('User without password:', userWithoutPassword); 
      return done(null, userWithoutPassword);
      
      
    } catch (error) {
      return done(error, false);
    }
  },
); 

export   {passportVerifyToken, passportVerifyAccount};




