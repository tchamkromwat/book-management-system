import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BooksService, PaginatedResponse } from './books.service';
import { BookQueryDto } from './dto/book-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@ApiTags('books')
@Controller('books')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new book' })
    @ApiResponse({
        status: 201,
        description: 'Book has been successfully created.',
        type: Book,
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async create(@Body() createBookDto: CreateBookDto, @Req() req: any): Promise<Book> {
        return this.booksService.create(createBookDto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all books with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in title and author' })
    @ApiQuery({ name: 'genre', required: false, type: String, description: 'Filter by genre' })
    @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by publication year' })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['title', 'author', 'published_year', 'createdAt'] })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
    @ApiResponse({
        status: 200,
        description: 'Books retrieved successfully.',
        type: [Book],
    })
    async findAll(@Query() query: BookQueryDto, @Req() req: any): Promise<PaginatedResponse<Book>> {
        return this.booksService.findAll(query, req.user);
    }

    @Get('genres')
    @ApiOperation({ summary: 'Get all available genres' })
    @ApiResponse({
        status: 200,
        description: 'Genres retrieved successfully.',
        type: [String],
    })
    async getGenres(): Promise<string[]> {
        return this.booksService.getGenres();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get book statistics' })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully.',
    })
    async getStats(): Promise<{
        totalBooks: number;
        totalGenres: number;
        booksThisYear: number;
        averageYear: number;
    }> {
        return this.booksService.getStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a book by id' })
    @ApiParam({ name: 'id', type: 'number', description: 'Book ID' })
    @ApiResponse({
        status: 200,
        description: 'Book retrieved successfully.',
        type: Book,
    })
    @ApiResponse({ status: 404, description: 'Book not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
        return this.booksService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a book' })
    @ApiParam({ name: 'id', type: 'number', description: 'Book ID' })
    @ApiResponse({
        status: 200,
        description: 'Book has been successfully updated.',
        type: Book,
    })
    @ApiResponse({ status: 404, description: 'Book not found.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBookDto: UpdateBookDto,
        @Req() req: any,
    ): Promise<Book> {
        return this.booksService.update(id, updateBookDto, req.user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a book' })
    @ApiParam({ name: 'id', type: 'number', description: 'Book ID' })
    @ApiResponse({ status: 204, description: 'Book has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Book not found.' })
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<void> {
        return this.booksService.remove(id, req.user);
    }
} 