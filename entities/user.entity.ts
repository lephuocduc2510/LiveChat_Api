import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert,BeforeUpdate, ManyToOne, AfterInsert, NumericType, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Room } from './room.entiy';
import { Role } from './role.entity';
import { RoomUser } from './roomUser.entity';
import { IsEmail, IsPhoneNumber } from 'class-validator';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'Userid', type: 'int' , unsigned: true})
  id: number;


  @Column({ name: 'fullName', length: 100, nullable: true })
  fullname: string;

  
  @Column({ name: 'username' ,unique: true, length: 50 })
  username: string;


  // Ràng buộc email
  
  @Column({ name: 'email',unique: true, length: 100 })
  @IsEmail()
  email: string;

  @Column({ name: 'password',length: 255 })
  password: string;

  @Column({ name: 'phoneNumber', length: 11 ,nullable: true })
  @IsPhoneNumber()
  phoneNumber: string;

  @Column({name: 'gender', type: 'bit', default: false, nullable: true})
  gender: boolean;


  @Column({ type: 'int', default: 1 })
  roleId: number;
  

  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'is_verified', type: 'bit', default: false })
  is_verified: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  
  @ManyToOne(() => Role, (role) => role.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
  
  @OneToMany(() => Room, (room) => room.user, { onDelete: 'CASCADE' })
  rooms: Room[];
  
  @OneToMany(() => RoomUser, (roomUser) => roomUser.user , { onDelete: 'CASCADE' })
  roomUsers: RoomUser[];


  // @BeforeInsert()
  // @BeforeUpdate()
  // async hashPassword() {
  //   if (this.password) {
  //     this.password = await bcrypt.hash(this.password, 10);
  //   }
  // }
  
}



