import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'Roles' })
export class Role {
  // ID
  @PrimaryColumn({ name: 'IdRole', type: 'int', unsigned: true, nullable: false })
  id: number;

  // ROLE NAME
  @Column({ name: 'RoleName', type: 'varchar', length: 50, unique: false })
  roleName: string;

 
  @OneToMany(() => User, (user) => user.roleId)
  usersId: User[];

 
}
