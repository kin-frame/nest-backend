import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getUserList(page: number, size: number, sort: string[]) {
    const alias = 'user';
    const qb = this.userRepo.createQueryBuilder(alias);

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
      page: Number(page),
      size: Number(size),
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  }
}
