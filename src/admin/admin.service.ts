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

  async getUserList(
    page: number,
    size: number,
    sort: string[],
    keywordType?: string,
    keyword?: string,
  ) {
    const alias = 'user';
    const qb = this.userRepo.createQueryBuilder(alias);

    // Filtering
    if (keyword && String(keyword).trim() !== '') {
      const type = (keywordType || '').toLowerCase();
      const trimmed = String(keyword).trim();

      if (type === 'id') {
        const idNum = Number(trimmed);
        if (!Number.isNaN(idNum)) {
          qb.andWhere(`${alias}.id = :id`, { id: idNum });
        } else {
          // Impossible condition to return empty result when id is invalid
          qb.andWhere('1=0');
        }
      } else if (type === 'email' || type === 'name') {
        qb.andWhere(`${alias}.${type} LIKE :kw`, { kw: `%${trimmed}%` });
      } else if (type === 'status' || type === 'role') {
        qb.andWhere(`${alias}.${type} = :kw`, { kw: trimmed });
      } else if (type === 'all' || type === '') {
        // Broad search across common text fields when type is 'all' or omitted
        qb.andWhere(`(${alias}.name LIKE :kw OR ${alias}.email LIKE :kw)`, {
          kw: `%${trimmed}%`,
        });
      }
    }

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
