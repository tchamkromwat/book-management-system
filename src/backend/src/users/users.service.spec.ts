import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

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

    const mockRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            username: 'newuser',
            password: 'password123',
            first_name: 'New',
            last_name: 'User',
            email: 'newuser@example.com',
        };

        it('should create a new user successfully', async () => {
            mockRepository.findOne.mockResolvedValueOnce(null); // Username doesn't exist
            mockRepository.findOne.mockResolvedValueOnce(null); // Email doesn't exist
            mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
            mockRepository.create.mockReturnValue({ ...createUserDto, id: 1 });
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await service.create(createUserDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { username: createUserDto.username },
            });
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password_hash: 'hashedpassword',
                password: undefined,
            });
            expect(result).toEqual(expect.objectContaining({
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                role: mockUser.role,
            }));
        });

        it('should throw ConflictException if username already exists', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { username: createUserDto.username },
            });
        });

        it('should throw ConflictException if username already exists', async () => {
            const existingUser = { ...mockUser, email: 'different@example.com' };
            mockRepository.findOne.mockResolvedValue(existingUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [mockUser, { ...mockUser, id: 2, username: 'user2' }];
            mockRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({
                select: ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'createdAt', 'updatedAt'],
            });
            expect(result).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should return user by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'createdAt', 'updatedAt'],
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            first_name: 'Updated',
            last_name: 'Name',
        };

        it('should update user successfully', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateUserDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                ...updateUserDto,
            });
            expect(result).toEqual(expect.objectContaining({
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                first_name: updateUserDto.first_name,
                last_name: updateUserDto.last_name,
                role: mockUser.role,
            }));
        });

        it('should not hash password in regular update', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            await service.update(1, updateUserDto);

            expect(mockedBcrypt.hash).not.toHaveBeenCalled();
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                ...updateUserDto,
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should hard delete user', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.remove.mockResolvedValue(mockUser);

            await service.remove(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('validateUser', () => {
        it('should return user for valid credentials', async () => {
            const serviceSpy = jest.spyOn(service, 'findOneByUsername').mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.validateUser('testuser', 'password123');

            expect(serviceSpy).toHaveBeenCalledWith('testuser');
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
            expect(result).toEqual(expect.objectContaining({
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                role: mockUser.role,
            }));
        });

        it('should return null for invalid username', async () => {
            const serviceSpy = jest.spyOn(service, 'findOneByUsername').mockResolvedValue(null);

            const result = await service.validateUser('nonexistent', 'password123');

            expect(result).toBeNull();
        });

        it('should return null for invalid password', async () => {
            const serviceSpy = jest.spyOn(service, 'findOneByUsername').mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            const result = await service.validateUser('testuser', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('updatePassword', () => {
        const updatePasswordDto: UpdateUserPasswordDto = {
            currentPassword: 'oldpassword',
            newPassword: 'newpassword',
        };

        it('should update password successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            mockedBcrypt.hash.mockResolvedValue('newhashedpassword' as never);
            mockRepository.save.mockResolvedValue(mockUser);

            await service.updatePassword(1, updatePasswordDto);

            expect(mockedBcrypt.compare).toHaveBeenCalledWith('oldpassword', 'hashedpassword');
            expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 12);
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                password_hash: 'newhashedpassword',
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.updatePassword(999, updatePasswordDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for incorrect current password', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(service.updatePassword(1, updatePasswordDto)).rejects.toThrow();
        });
    });
}); 