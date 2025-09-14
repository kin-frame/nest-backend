import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
