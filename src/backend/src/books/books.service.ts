import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
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

    async create(createBookDto: CreateBookDto, userId: number): Promise<Book> {
        const book = this.bookRepository.create({
            ...createBookDto,
            createdByUser: { id: userId } as User,
        });
        return await this.bookRepository.save(book);
    }

    async findAll(query: BookQueryDto, user: any): Promise<PaginatedResponse<Book>> {
        const { page = 1, limit = 10, search, genre, year, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

        // Calculate offset
        const skip = (page - 1) * limit;

        // Build query with user relations
        let queryBuilder = this.bookRepository.createQueryBuilder('book')
            .leftJoinAndSelect('book.createdByUser', 'user');

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

    async update(id: number, updateBookDto: UpdateBookDto, user: any): Promise<Book> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['createdByUser']
        });

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        // Check permissions: user can only edit their own books, librarian and admin can edit all
        if (user.role !== 'librarian' && user.role !== 'admin' && book.createdByUser?.id !== user.id) {
            throw new ForbiddenException('You can only edit your own books');
        }

        Object.assign(book, updateBookDto);
        return await this.bookRepository.save(book);
    }

    async remove(id: number, user: any): Promise<void> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['createdByUser']
        });

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        // Check permissions: user can only delete their own books, librarian and admin can delete all
        if (user.role !== 'librarian' && user.role !== 'admin' && book.createdByUser?.id !== user.id) {
            throw new ForbiddenException('You can only delete your own books');
        }

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