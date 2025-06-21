import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: 'User email', example: 'john.doe@example.com', required: false })
    email?: string;

    @ApiProperty({ description: 'First name', example: 'John', required: false })
    first_name?: string;

    @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
    last_name?: string;

    @ApiProperty({ description: 'User role', example: 'user', required: false, enum: ['user', 'admin'] })
    role?: string;

    @ApiProperty({ description: 'Account status', example: true, required: false })
    @IsOptional()
    is_active?: boolean;
}

// Exclude password from updates for security
export class UpdateUserPasswordDto {
    @ApiProperty({ description: 'Current password', example: 'oldpassword123' })
    currentPassword: string;

    @ApiProperty({ description: 'New password', example: 'newpassword123' })
    newPassword: string;
} 