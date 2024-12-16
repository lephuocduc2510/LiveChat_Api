import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'Reset_Tokens' })
export class ResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 255 })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}
