import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBookDto {
    @ApiProperty({
        description: 'Book title',
        example: 'The Great Gatsby',
        maxLength: 255
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Book author',
        example: 'F. Scott Fitzgerald',
        maxLength: 255
    })
    @IsNotEmpty()
    @IsString()
    author: string;

    @ApiProperty({
        description: 'Publication year',
        example: 1925,
        required: false
    })
    @IsOptional()
    @IsInt()
    @Min(1000)
    @Max(new Date().getFullYear() + 10)
    published_year?: number;

    @ApiProperty({
        description: 'Book genre',
        example: 'Fiction',
        maxLength: 100,
        required: false
    })
    @IsOptional()
    @IsString()
    genre?: string;
} 