import 'reflect-metadata';
require('dotenv').config();
import { DataSource } from 'typeorm';
import { ResetToken } from './entities/resetToken.entity';
import { Role } from './entities/role.entity';
import { Room } from './entities/room.entiy';
import { RoomUser } from './entities/roomUser.entity';
import { User } from './entities/user.entity';
import { UserVerification } from './entities/userVerification.entiy';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.SQL_HOST ,
  port: Number(process.env.SQL_PORT) || 3306,
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD ,
  database: process.env.SQL_DATABASE ,
  // entities: ['entities/**/*.entity{.ts,.js}'],
  entities: [ResetToken, Role,Room,RoomUser,User, UserVerification],
  migrations: ["entities/migration/*.ts"],
  synchronize: true,
  logging: false,
  options: {
    encrypt: false,
  },
});