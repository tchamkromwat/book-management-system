import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    const mockUsersService = {
        create: jest.fn(),
        validateUser: jest.fn(),
        findOne: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            username: 'newuser',
            password: 'password123',
        };

        it('should register a new user successfully', async () => {
            mockUsersService.create.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.username,
                role: mockUser.role,
            });
            expect(result).toEqual({
                user: mockUser,
                access_token: 'jwt-token',
            });
        });

        it('should propagate errors from users service', async () => {
            const error = new Error('User creation failed');
            mockUsersService.create.mockRejectedValue(error);

            await expect(service.register(registerDto)).rejects.toThrow(error);
            expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            username: 'testuser',
            password: 'password123',
        };

        it('should login user with valid credentials', async () => {
            mockUsersService.validateUser.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(mockUsersService.validateUser).toHaveBeenCalledWith(
                loginDto.username,
                loginDto.password,
            );
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.username,
                role: mockUser.role,
            });
            expect(result).toEqual({
                user: mockUser,
                access_token: 'jwt-token',
            });
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            mockUsersService.validateUser.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.validateUser).toHaveBeenCalledWith(
                loginDto.username,
                loginDto.password,
            );
        });

        it('should throw UnauthorizedException for inactive user', async () => {
            const inactiveUser = { ...mockUser, is_active: false };
            mockUsersService.validateUser.mockResolvedValue(inactiveUser);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('validateUser', () => {
        it('should return user data for valid JWT payload', async () => {
            const payload = {
                sub: mockUser.id,
                username: mockUser.username,
                role: mockUser.role,
            };
            mockUsersService.findOne.mockResolvedValue(mockUser);

            const result = await service.validateUser(payload);

            expect(mockUsersService.findOne).toHaveBeenCalledWith(payload.sub);
            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            const payload = {
                sub: 999,
                username: 'nonexistent',
                role: 'user',
            };
            mockUsersService.findOne.mockResolvedValue(null);

            await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for inactive user', async () => {
            const payload = {
                sub: mockUser.id,
                username: mockUser.username,
                role: mockUser.role,
            };
            const inactiveUser = { ...mockUser, is_active: false };
            mockUsersService.findOne.mockResolvedValue(inactiveUser);

            await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refreshToken', () => {
        it('should generate new access token for user', async () => {
            mockJwtService.sign.mockReturnValue('new-jwt-token');

            const result = await service.refreshToken(mockUser);

            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.username,
                role: mockUser.role,
            });
            expect(result).toEqual({
                user: mockUser,
                access_token: 'new-jwt-token',
            });
        });
    });
}); 