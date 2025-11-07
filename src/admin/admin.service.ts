import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import {
  UpdateAdminUserInfoReqDto,
  UpdateUserRoleReqDto,
  UpdateUserStatusReqDto,
} from './dto/user.dto';

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

  async getUserInfo(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async updateUserInfo(id: number, dto: UpdateAdminUserInfoReqDto) {
    const payload: Partial<User> = {};

    if (dto.fileCount !== undefined) payload.fileCount = dto.fileCount;
    if (dto.maxFileSize !== undefined) payload.maxFileSize = dto.maxFileSize;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('수정할 값이 없습니다.');
    }

    const result = await this.userRepo.update({ id }, payload);
    if (!result.affected) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.userRepo.findOne({ where: { id } });
  }

  async updateUserRole(id: number, dto: UpdateUserRoleReqDto) {
    const payload: Partial<User> = {};

    if (dto.role !== undefined) payload.role = dto.role;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('수정할 값이 없습니다.');
    }

    const result = await this.userRepo.update({ id }, payload);
    if (!result.affected) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.userRepo.findOne({ where: { id } });
  }

  async updateUserStatus(id: number, dto: UpdateUserStatusReqDto) {
    const payload: Partial<User> = {};

    if (dto.status !== undefined) payload.status = dto.status;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('수정할 값이 없습니다.');
    }

    const result = await this.userRepo.update({ id }, payload);
    if (!result.affected) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.userRepo.findOne({ where: { id } });
  }
}
