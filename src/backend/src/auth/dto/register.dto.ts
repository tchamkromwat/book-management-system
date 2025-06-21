import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ description: 'Username', example: 'john_doe' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string;
} 