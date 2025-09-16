import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['userId', 'fileName']) // 같은 사용자 + 같은 파일명 금지
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  // 파일 소유자 (userId)
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
  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
