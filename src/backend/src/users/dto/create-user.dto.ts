import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: 'Username', example: 'john_doe' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ description: 'User email', example: 'john.doe@example.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string;

    @ApiProperty({ description: 'First name', example: 'John', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    first_name?: string;

    @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    last_name?: string;

    @ApiProperty({ description: 'User role', example: 'user', required: false, enum: ['user', 'admin'] })
    @IsOptional()
    @IsString()
    @IsIn(['user', 'admin'])
    role?: string = 'user';
} 