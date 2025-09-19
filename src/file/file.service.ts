import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File, FileStatus } from './file.entity';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
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

  async updateThumbnail(id: number) {
    const existing = await this.fileRepo.findOne({
      where: { id },
    });

    if (!existing) {
      throw new Error(`파일이 존재하지 않습니다.`);
    }

    if (existing.fileType.startsWith('image/')) {
      const buffer = await this.downloadfromS3(existing.key);

      const resizedBuffer = await sharp(buffer).resize(300).toBuffer();

      if (!resizedBuffer) {
        throw new Error('이미지 변환에 실패했습니다.');
      }

      const thumbnailKey = existing.key.replace('uploads/', 'thumbnails/');

      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: thumbnailKey,
          Body: resizedBuffer,
          ContentType: existing.fileType,
        }),
      );

      await this.fileRepo.update(id, { thumbnailKey });
    }
  }

  async downloadfromS3(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    const response = await this.s3.send(command);

    const stream = await response.Body?.transformToByteArray();

    if (!stream) return;

    const buffer = Buffer.from(stream);

    return buffer;
  }

  async getFileKey(id: number) {
    return this.fileRepo.findOne({ where: { id } });
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
