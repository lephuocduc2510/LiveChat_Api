import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'UserVerification' })
export class UserVerification {
  @PrimaryGeneratedColumn({ name: 'VerificationId', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'unique_string', length: 255 })
  uniqueString: string;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'expire_at', type: 'datetime' })
  expireAt: Date;

   // Cột khóa phụ liên kết tới User
   @Column({ name: 'user_id', type: 'int' }) 
   userId: number;


  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' }) // Thiết lập khóa phụ với JoinColumn
  user: User;
}
