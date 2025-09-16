import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  async createMeta(data: Partial<File>) {
    const existing = await this.fileRepo.findOne({
      where: { userId: data.userId, fileName: data.fileName },
    });

    if (existing) {
      throw new Error(`duplicate`);
    }

    return this.fileRepo.save(data);
  }

  async updateStatus(id: number, status: string) {
    return this.fileRepo.update({ id }, { status });
  }

  async findByKey(key: string) {
    return this.fileRepo.findOne({ where: { key } });
  }
}
