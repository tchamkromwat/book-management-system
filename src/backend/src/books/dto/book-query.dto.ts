import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BookQueryDto {
    @ApiProperty({ description: 'Page number', example: 1, required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', example: 10, required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({ description: 'Search in title and author', example: 'gatsby', required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ description: 'Filter by genre', example: 'Fiction', required: false })
    @IsOptional()
    @IsString()
    genre?: string;

    @ApiProperty({ description: 'Filter by publication year', example: 1925, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1000)
    @Max(new Date().getFullYear())
    year?: number;

    @ApiProperty({
        description: 'Sort by field',
        example: 'title',
        enum: ['title', 'author', 'published_year', 'createdAt'],
        required: false,
        default: 'createdAt'
    })
    @IsOptional()
    @IsString()
    @IsIn(['title', 'author', 'published_year', 'createdAt'])
    sortBy?: string = 'createdAt';

    @ApiProperty({
        description: 'Sort order',
        example: 'ASC',
        enum: ['ASC', 'DESC'],
        required: false,
        default: 'DESC'
    })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: string = 'DESC';
} 