import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'User unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '홍길동' })
  @Column()
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    nullable: true,
  })
  @Column({ nullable: true })
  picture: string;

  @ApiProperty({
    enum: ['PENDING', 'SUBMIT', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
    description: 'Account review status',
    default: 'PENDING',
  })
  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'SUBMIT' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    enum: ['ADMIN', 'USER', 'GUEST'],
    example: 'GUEST',
    description: 'Authorization role',
    default: 'GUEST',
  })
  @Column({ default: 'GUEST' })
  role: 'ADMIN' | 'USER' | 'GUEST';

  @ApiProperty({ example: 3, minimum: 0 })
  @Column({ default: 3 })
  fileCount: number;

  @ApiProperty({
    example: 10 * 1024 * 1024,
    description: 'Max upload size in bytes',
  })
  @Column({ default: 10 * 1024 * 1024 })
  maxFileSize: number;

  @ApiProperty({ example: '' })
  @Column({ default: '' })
  message: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @Column({ nullable: true })
  lastLoginedAt: Date;

  @ApiPropertyOptional({
    example: '127.0.0.1',
    nullable: true,
    description: 'Last login IP',
  })
  @Column({ nullable: true })
  lastLoginedIp: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Active session id if any',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string | null;
}
