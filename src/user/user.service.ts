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
import { User, UserStatus } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findBySessionId(sessionId: string) {
    const user = await this.userRepo.findOne({
      where: { sessionId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findByCode(code: string) {
    const user = await this.userRepo.findOne({
      where: { code },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async updateLastLoginedAt(id: number) {
    const user = await this.userRepo.update(
      {
        id,
      },
      { lastLoginedAt: new Date() },
    );

    return user;
  }

  async updateSessionId(id: number, sessionId: string) {
    const user = await this.userRepo.update(
      {
        id,
      },
      { sessionId },
    );

    return user;
  }

  async deleteSessionId(id: number) {
    return this.userRepo.update(
      {
        id,
      },
      {
        sessionId: null,
      },
    );
  }

  async updateUserCode(id: number, code: string) {
    const user = await this.userRepo.update(
      {
        id,
      },
      { code },
    );

    return user;
  }

  async deleteUserCOde(id: number) {
    return this.userRepo.update(
      {
        id,
      },
      {
        code: null,
      },
    );
  }

  async updateLastLoginedIp(id: number, ip?: string) {
    const user = await this.userRepo.update(
      {
        id,
      },
      { lastLoginedIp: ip },
    );

    return user;
  }

  async findOrCreate(googleUser: GoogleUser) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        status: UserStatus.PENDING,
      });

      await this.userRepo.save(user);
    }

    return user;
  }

  async signup(dto: UserSignupDto, userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');

    if (user.status === UserStatus.SUBMIT) {
      throw new ConflictException('이미 회원가입 신청을 완료했습니다.');
    }

    if (user.status === UserStatus.APPROVED) {
      throw new ConflictException('이미 회원가입 완료한 사용자입니다.');
    }

    user.name = dto.name;
    user.message = dto.message;
    user.status = UserStatus.SUBMIT; // 제출상태로 바꾸고 나중에 관리자가 처리

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

  async signupCheck(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });

    return {
      status: user?.status,
    };
  }

  async getUserProfile(userId: number) {
    return this.userRepo.findOne({
      where: { id: userId },
      select: { name: true, email: true, role: true },
    });
  }
}
