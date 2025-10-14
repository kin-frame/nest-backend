import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Directory } from './directory.entity';

const RESERVED = ['CON', 'PRN', 'AUX', 'NUL', 'SYSTEM', 'ROOT', 'HOME'];

@Injectable()
export class DirectoryService {
  constructor(
    @InjectRepository(Directory)
    private directoryRepo: Repository<Directory>,
  ) {}

  async create(data: Pick<Directory, 'directoryName' | 'parentId' | 'userId'>) {
    if (RESERVED.includes(data.directoryName.toUpperCase())) {
      throw new BadRequestException('예약어는 사용할 수 없습니다.');
    }

    const existing = await this.directoryRepo.findOne({
      where: {
        userId: data.userId,
        directoryName: data.directoryName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `같은 경로에 동일한 디렉토리명이 존재합니다.`,
      );
    }

    return this.directoryRepo.save(data);
  }
}
