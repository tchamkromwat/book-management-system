import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...userData } = createUserDto;

        // Check if username already exists
        const existingUserByUsername = await this.userRepository.findOne({
            where: { username: createUserDto.username },
        });

        if (existingUserByUsername) {
            throw new ConflictException('User with this username already exists');
        }

        // Check if email already exists (only if email is provided)
        if (createUserDto.email) {
            const existingUserByEmail = await this.userRepository.findOne({
                where: { email: createUserDto.email },
            });

            if (existingUserByEmail) {
                throw new ConflictException('User with this email already exists');
            }
        }

        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        try {
            const user = this.userRepository.create({
                ...userData,
                password_hash,
            });

            const savedUser = await this.userRepository.save(user);

            // Remove password_hash from response
            const { password_hash: _, ...userResponse } = savedUser;
            return userResponse as User;
        } catch (error: any) {
            if (error.code === '23505') { // PostgreSQL unique constraint error
                throw new ConflictException('User with this email already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            select: ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'createdAt', 'updatedAt'],
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
        });
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { username },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if email is being updated and if it already exists
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('User with this email already exists');
            }
        }

        // Check if username is being updated and if it already exists
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updateUserDto.username },
            });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('User with this username already exists');
            }
        }

        try {
            Object.assign(user, updateUserDto);
            const updatedUser = await this.userRepository.save(user);

            // Return user without password_hash
            const { password_hash: _, ...userResponse } = updatedUser;
            return userResponse as User;
        } catch (error: any) {
            if (error.code === '23505') { // PostgreSQL unique constraint error
                throw new ConflictException('User with this email already exists');
            }
            throw error;
        }
    }

    async updatePassword(id: number, updatePasswordDto: UpdateUserPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            updatePasswordDto.currentPassword,
            user.password_hash,
        );

        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, saltRounds);

        user.password_hash = newPasswordHash;
        await this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.userRepository.remove(user);
    }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.findOneByUsername(username);

        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash: _, ...result } = user;
            return result as User;
        }

        return null;
    }
} 