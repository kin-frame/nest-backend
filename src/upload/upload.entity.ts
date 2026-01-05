import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { File } from 'src/file/file.entity';

@Entity()
export class Upload {
  @ApiProperty({ example: 1, description: 'Upload progress unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  // 업로드 요청자 (userId)
  @ApiProperty({ example: 42, description: 'Upload request user id' })
  @Column()
  userId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  file: File;

  @ApiProperty({ type: Number, description: '현재 진행중인 업로드 단계' })
  @Column()
  partIndex: number;

  @ApiProperty({ type: Number, description: '진행할 업로드 카운트' })
  @Column()
  partCount: number;

  @ApiProperty({
    type: Number,
    description: '업로드 청크 사이즈',
    default: 5 * 1024 * 1024,
  })
  @Column()
  partSize: number;
}
