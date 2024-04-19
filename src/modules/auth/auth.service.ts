import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiError } from '../../common/classes';
import { User } from '../../database/models';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDTO } from './dtos/change-pass.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDto) {
    const { username, password } = data;

    const user = await this.userRepo.findOneBy({ username });

    if (!user) throw new ApiError('User not found');

    const check = await user.validatePassword(password);

    if (!check) throw new ApiError('Wrong username or password');

    return {
      token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
    };
  }

  async changePassword(data: ChangePasswordDTO, userId: number) {
    const { oldPassword, newPassword } = data;

    if (!userId) throw new ApiError('Invalid user');

    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) throw new ApiError('User not found');

    if (oldPassword && !(await user.validatePassword(oldPassword))) {
      throw new ApiError('Current password incorrect');
    }

    user.password = newPassword;

    await this.userRepo.save(user);

    return true;
  }
}
