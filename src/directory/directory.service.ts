import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

    const info = await this.getInfo(data.parentId, data.userId);

    if (!info) {
      throw new BadRequestException(
        '해당 디렉토리가 존재하지 않거나, 다른 사용자의 디렉토리입니다.',
      );
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

  async getInfo(directoryId: number, userId: number) {
    return this.directoryRepo.findOne({
      where: {
        id: directoryId,
        userId,
        isDeleted: false,
      },
      relations: {
        files: true,
      },
    });
  }

  async getRoot(userId: number) {
    return this.directoryRepo.findOne({
      where: {
        userId,
      },
    });
  }

  async getChildren(directoryId: number, userId: number) {
    return this.directoryRepo.find({
      where: {
        parentId: directoryId,
        userId,
        isDeleted: false,
      },
    });
  }

  async delete(data: Pick<Directory, 'id' | 'userId'>) {
    const target = await this.directoryRepo.findOne({
      where: { id: data.id, userId: data.userId, isDeleted: false },
    });

    if (!target) {
      throw new BadRequestException('삭제할 디렉토리를 찾을 수 없습니다.');
    }

    if (target.isRoot) {
      throw new BadRequestException('루트 디렉토리는 삭제할 수 없습니다.');
    }

    const ids: number[] = [target.id];
    const queue: number[] = [target.id];

    while (queue.length > 0) {
      // Queue를 비우고 전부 batch에 담기
      const batch = queue.splice(0, queue.length);

      const children = await this.directoryRepo.find({
        where: batch.map((parentId) => ({
          parentId,
          userId: data.userId,
          isDeleted: false,
        })),
        select: { id: true },
      });

      if (children.length === 0) continue;

      const childIds = children.map((c) => c.id);
      ids.push(...childIds);
      queue.push(...childIds);
    }

    await this.directoryRepo.update(
      { id: In(ids), userId: data.userId },
      { isDeleted: true },
    );

    return { deletedCount: ids.length };
  }
}
