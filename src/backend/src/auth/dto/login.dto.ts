import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ description: 'Username', example: 'john_doe' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString()
    @MinLength(6)
    password: string;
} 