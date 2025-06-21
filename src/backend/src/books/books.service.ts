import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { BookQueryDto } from './dto/book-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) { }

    async create(createBookDto: CreateBookDto): Promise<Book> {
        const book = this.bookRepository.create(createBookDto);
        return await this.bookRepository.save(book);
    }

    async findAll(query: BookQueryDto): Promise<PaginatedResponse<Book>> {
        const { page = 1, limit = 10, search, genre, year, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

        // Build where conditions
        const whereConditions: FindManyOptions<Book>['where'] = {};

        if (search) {
            whereConditions.title = Like(`%${search}%`);
            // Note: TypeORM doesn't support OR in simple where, we'll use QueryBuilder for complex OR
        }

        if (genre) {
            whereConditions.genre = Like(`%${genre}%`);
        }

        if (year) {
            whereConditions.published_year = year;
        }

        // Calculate offset
        const skip = (page - 1) * limit;

        // For complex search with OR conditions, use QueryBuilder
        let queryBuilder = this.bookRepository.createQueryBuilder('book');

        if (search) {
            queryBuilder = queryBuilder.where(
                'book.title ILIKE :search OR book.author ILIKE :search',
                { search: `%${search}%` }
            );
        }

        if (genre) {
            const condition = search ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[condition]('book.genre ILIKE :genre', { genre: `%${genre}%` });
        }

        if (year) {
            const condition = search || genre ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[condition]('book.published_year = :year', { year });
        }

        // Apply pagination and sorting
        queryBuilder = queryBuilder
            .orderBy(`book.${sortBy}`, sortOrder as 'ASC' | 'DESC')
            .skip(skip)
            .take(limit);

        const [books, total] = await queryBuilder.getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            data: books,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async findOne(id: number): Promise<Book> {
        const book = await this.bookRepository.findOne({ where: { id } });

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        return book;
    }

    async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
        const book = await this.findOne(id);

        Object.assign(book, updateBookDto);
        return await this.bookRepository.save(book);
    }

    async remove(id: number): Promise<void> {
        const book = await this.findOne(id);
        await this.bookRepository.remove(book);
    }

    async getGenres(): Promise<string[]> {
        const result = await this.bookRepository
            .createQueryBuilder('book')
            .select('DISTINCT book.genre', 'genre')
            .where('book.genre IS NOT NULL')
            .andWhere('book.genre != \'\'')
            .getRawMany();

        return result.map(item => item.genre).filter(Boolean);
    }

    async getStats(): Promise<{
        totalBooks: number;
        totalGenres: number;
        booksThisYear: number;
        averageYear: number;
    }> {
        const currentYear = new Date().getFullYear();

        const totalBooks = await this.bookRepository.count();

        const booksThisYear = await this.bookRepository.count({
            where: { published_year: currentYear },
        });

        // Get unique genres count
        const uniqueGenres = await this.bookRepository
            .createQueryBuilder('book')
            .select('DISTINCT book.genre')
            .where('book.genre IS NOT NULL')
            .andWhere('book.genre != \'\'')
            .getCount();

        // Get average year
        const avgYearResult = await this.bookRepository
            .createQueryBuilder('book')
            .select('AVG(book.published_year)', 'average')
            .where('book.published_year IS NOT NULL')
            .getRawOne();

        return {
            totalBooks,
            totalGenres: uniqueGenres,
            booksThisYear,
            averageYear: Math.round(Number(avgYearResult?.average) || 0),
        };
    }
} 