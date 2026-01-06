import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Client } from '@aws-sdk/client-s3';
import { Repository } from 'typeorm';

import { Upload } from './upload.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepo: Repository<Upload>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async createMeta(data: Partial<Upload>) {
    const fileId = data.file?.id;

    if (!fileId) {
      throw new Error('file id required');
    }

    const existing = await this.uploadRepo.findOne({
      where: { file: { id: fileId } },
      select: { id: true },
    });

    if (existing) {
      throw new Error(`duplicate`);
    }

    return this.uploadRepo.save(data);
  }
}
