import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Directory } from 'src/directory/directory.entity';

export enum FileStatus {
  PENDING = 'PENDING', // 업로드 대기 중
  UPLOADED = 'UPLOADED', // 업로드 완료
  DELETED = 'DELETED', // 삭제
  REMOVED = 'REMOVED', // 영구삭제(버킷까지)
}

@Entity()
@Index(['userId', 'directory', 'fileName'], { unique: true }) // 같은 폴더 내 같은 파일명 금지
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  // 파일 소유자 (userId)
  @Index()
  @Column()
  userId: number;

  // S3 Key (uploads/userId/...)
  @Column({ unique: true })
  key: string;

  @Column({ type: 'datetime', nullable: true })
  lastModified: Date;

  // 원본 파일명
  @Column()
  fileName: string;

  // 파일 크기 (bytes)
  @Column({ type: 'bigint' })
  fileSize: number;

  // MIME 타입 (image/png, video/mp4 등)
  @Column()
  fileType: string;

  // 상태 (PENDING, UPLOADED, PROCESSED 등)
  @Column({ default: FileStatus.PENDING })
  status: FileStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // S3 Key (uploads/userId/...)
  @Column({ nullable: true })
  thumbnailKey: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @ManyToOne(() => Directory, { nullable: true, onDelete: 'SET NULL' })
  directory: Directory;
}
