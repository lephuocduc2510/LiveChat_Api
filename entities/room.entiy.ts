import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RoomUser } from './roomUser.entity';
import c from 'config';

@Entity({ name: 'Rooms' })
export class Room {
  @PrimaryGeneratedColumn({ name: 'Roomid', type: 'int', unsigned: true })
  id: number;

  @Column({ length: 100, default: '' })
  name: string;
  
  @Column({ length: 100, default: '' })
  description: string;

  @Column({ type: 'int', default: 0 })
  createdBy: number;

  @Column({ name: 'groupLogo', length: 255, nullable: true })
  groupLogo: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;


  @ManyToOne(() => User, (user) => user.rooms)
  @JoinColumn({ name: 'createdBy' })
  user: User;
  

  
  @OneToMany(() => RoomUser, (roomUser) => roomUser.room, { onDelete: 'CASCADE' })
  roomUsers: RoomUser[];
}
