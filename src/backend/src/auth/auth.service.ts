import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
    access_token: string;
    user: User;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const user = await this.usersService.create(registerDto);
        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user,
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.usersService.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Account is inactive');
        }

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user,
        };
    }

    async validateUser(payload: JwtPayload): Promise<User> {
        const user = await this.usersService.findOne(payload.sub);

        if (!user || !user.is_active) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }

    async refreshToken(user: User): Promise<AuthResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user,
        };
    }
} 