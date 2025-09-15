import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GoogleUser } from 'src/auth/auth.controller';
import { UserSignupDto } from './dto/signup.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findOrCreate(googleUser: GoogleUser) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        status: 'PENDING',
      });

      await this.userRepo.save(user);
    }

    return user;
  }

  async signup(dto: UserSignupDto, userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');

    if (user.status === 'SUBMIT') {
      throw new ConflictException('이미 회원가입 신청을 완료했습니다.');
    }

    if (user.status === 'APPROVED') {
      throw new ConflictException('이미 회원가입 완료한 사용자입니다.');
    }

    user.name = dto.name;
    user.message = dto.message;
    user.status = 'SUBMIT'; // 제출상태로 바꾸고 나중에 관리자가 처리

    try {
      await this.userRepo.save(user);

      return {
        status: 'success',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('회원가입 처리 도중 오류가 발생했습니다.');
    }
  }
}
