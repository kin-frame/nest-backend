import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File, FileStatus } from './file.entity';

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

  async updateStatus(id: number, status: FileStatus) {
    return this.fileRepo.update({ id }, { status });
  }

  async findByKey(key: string) {
    return this.fileRepo.findOne({ where: { key } });
  }

  async getFiles(
    page: number,
    size: number,
    sort: string[],
    { userId }: Partial<File>,
  ) {
    const alias = 'file';
    const qb = this.fileRepo.createQueryBuilder(alias);

    qb.andWhere(`${alias}.userId LIKE :userId`, {
      userId,
    });

    if (sort.length > 0) {
      const [field, order] = sort[0].split(',');
      qb.orderBy(`${alias}.${field}`, order as 'ASC' | 'DESC');

      for (let i = 1; i < sort.length; i++) {
        const [field, order] = sort[i].split(',');
        qb.addOrderBy(`${alias}.${field}`, order as 'ASC' | 'DESC');
      }
    }

    qb.skip(page * size).take(size);

    const [content, totalCount] = await qb.getManyAndCount();

    return {
      content,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  }
}
