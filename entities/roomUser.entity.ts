import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entiy';
import { User } from './user.entity';


@Entity({ name: 'Room_Users' })
export class RoomUser {
  
  @PrimaryGeneratedColumn({ name: 'RoomUserId', type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int'})
  roomId: number;

  @Column({ type: 'int' })
  userId: number;

 // Mối quan hệ với bảng Room
 @ManyToOne(() => Room, (room) => room.roomUsers, { onDelete: 'CASCADE' })
 @JoinColumn({ name: 'roomId' })
 room: Room;

 // Mối quan hệ với bảng User
 @ManyToOne(() => User, (user) => user.roomUsers, { onDelete: 'CASCADE' })
 @JoinColumn({ name: 'userId' })
 user: User;
  
 
}
