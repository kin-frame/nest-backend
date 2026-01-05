import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { Directory } from 'src/directory/directory.entity';
import { Upload } from 'src/upload/upload.entity';

export enum FileStatus {
  PENDING = 'PENDING', // 업로드 대기 중
  UPLOADED = 'UPLOADED', // 업로드 완료
  DELETED = 'DELETED', // 삭제
  REMOVED = 'REMOVED', // 영구삭제(버킷까지)
}

@Entity()
@Index(['userId', 'directory', 'fileName'], { unique: true }) // 같은 폴더 내 같은 파일명 금지
export class File {
  @ApiProperty({ example: 1, description: 'File unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  // 파일 소유자 (userId)
  @ApiProperty({ example: 42, description: 'Owner user id' })
  @Index()
  @Column()
  userId: number;

  // S3 Key (uploads/userId/...)
  @ApiProperty({ example: 'uploads/42/2024/11/photo-abc123.png' })
  @Column({ unique: true })
  key: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @Column({ type: 'datetime', nullable: true })
  lastModified: Date;

  // 원본 파일명
  @ApiProperty({ example: 'photo.png' })
  @Column()
  fileName: string;

  // 파일 크기 (bytes)
  @ApiProperty({ example: 1234567, description: 'File size in bytes' })
  @Column({ type: 'bigint' })
  fileSize: number;

  // MIME 타입 (image/png, video/mp4 등)
  @ApiProperty({ example: 'image/png', description: 'MIME type' })
  @Column()
  fileType: string;

  // 상태 (PENDING, UPLOADED, PROCESSED 등)
  @ApiProperty({
    enum: FileStatus,
    enumName: 'FileStatus',
    example: 'PENDING',
    default: 'PENDING',
  })
  @Column({ default: FileStatus.PENDING })
  status: FileStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;

  // S3 Key (uploads/userId/...)
  @ApiPropertyOptional({
    example: 'thumbnails/42/2024/11/photo-abc123.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  thumbnailKey: string;

  @ApiProperty({ example: 1920 })
  @Column()
  width: number;

  @ApiProperty({ example: 1080 })
  @Column()
  height: number;

  @ManyToOne(() => Directory, { nullable: true, onDelete: 'SET NULL' })
  directory: Directory;

  @ApiPropertyOptional({ example: 123, nullable: true })
  @RelationId((file: File) => file.directory)
  directoryId: number;

  @ApiProperty({ example: '', description: 'AWS S3 URL' })
  @Column({ type: 'text' })
  fileUrl?: string;

  @ApiProperty({ example: '', description: 'AWS S3 Thumbnail URL' })
  @Column({ type: 'text' })
  thumbnailUrl?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Presigned URL 만료기한',
  })
  @Column({
    type: 'datetime',
    nullable: true,
    transformer: {
      from: (value: Date | null) => {
        return value?.getTime() ? value : null;
      },
      to: (value: Date | null) => value,
    },
  })
  expiresAt?: Date | null;

  @OneToOne(() => Upload, { nullable: true, onDelete: 'SET NULL' })
  uploadId: Upload;
}
