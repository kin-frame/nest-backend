import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { File } from 'src/file/file.entity';

@Entity()
@Index(['userId', 'parentId', 'directoryName'], { unique: true }) // 같은 경로 내 동일 이름 방지
export class Directory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  parentId?: number; // 루트 디렉토리 지원

  // 디렉토리 소유자 (userId)
  @Index()
  @Column()
  userId: number;

  // 디렉토리 명
  @Column()
  directoryName: string;

  @Column({ default: false })
  isDeleted: boolean; // 디렉토리 삭제시 복원 가능

  @Column({ nullable: true })
  path: string; // 캐시용 (예: "/photos/2025/trip")

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @OneToMany(() => File, (file) => file.directory)
  files: File[];
}
