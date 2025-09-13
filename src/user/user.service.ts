import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GoogleUser } from 'src/auth/auth.controller';
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
        // picture: googleUser.picture,
        status: 'PENDING',
      });

      await this.userRepo.save(user);
    }

    return user;
  }
}
