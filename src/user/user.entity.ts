import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'SUBMIT' | 'APPROVED' | 'REJECTED';

  @Column({ default: 'GUEST' })
  role: 'ADMIN' | 'USER' | 'GUEST';

  @Column({ default: 3 })
  fileCount: number;

  @Column({ default: 10 * 1024 * 1024 })
  maxFileSize: number;

  @Column({ default: '' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginedAt: Date;

  @Column({ nullable: true })
  lastLoginedIp: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string | null;
}
