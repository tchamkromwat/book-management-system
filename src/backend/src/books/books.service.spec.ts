import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

describe('BooksService', () => {
    let service: BooksService;
    let repository: Repository<Book>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
    };

    const mockLibrarian = {
        id: 2,
        username: 'librarian',
        role: 'librarian',
    };

    const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        published_year: 2023,
        genre: 'Fiction',
        createdByUser: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<BooksService>(BooksService);
        repository = module.get<Repository<Book>>(getRepositoryToken(Book));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a book with user ID', async () => {
            const createBookDto: CreateBookDto = {
                title: 'New Book',
                author: 'New Author',
                published_year: 2023,
                genre: 'Fiction',
            };

            mockRepository.create.mockReturnValue({
                ...createBookDto,
                createdByUser: { id: mockUser.id },
            });
            mockRepository.save.mockResolvedValue(mockBook);

            const result = await service.create(createBookDto, mockUser.id);

            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createBookDto,
                createdByUser: { id: mockUser.id },
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockBook);
        });
    });

    describe('findAll', () => {
        it('should return paginated books with user relations', async () => {
            const query = { page: 1, limit: 10 };
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findAll(query, mockUser);

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('book.createdByUser', 'user');
            expect(result).toEqual({
                data: [mockBook],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
    });

    describe('update', () => {
        const updateBookDto: UpdateBookDto = {
            title: 'Updated Book',
        };

        it('should update book when user owns it', async () => {
            mockRepository.findOne.mockResolvedValue(mockBook);
            mockRepository.save.mockResolvedValue({ ...mockBook, ...updateBookDto });

            const result = await service.update(1, updateBookDto, mockUser);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['createdByUser'],
            });
            expect(result.title).toBe('Updated Book');
        });

        it('should update book when user is librarian', async () => {
            mockRepository.findOne.mockResolvedValue(mockBook);
            mockRepository.save.mockResolvedValue({ ...mockBook, ...updateBookDto });

            const result = await service.update(1, updateBookDto, mockLibrarian);

            expect(result.title).toBe('Updated Book');
        });

        it('should throw ForbiddenException when user does not own book', async () => {
            const otherUserBook = { ...mockBook, createdByUser: { id: 999, username: 'otheruser' } };
            mockRepository.findOne.mockResolvedValue(otherUserBook);

            await expect(service.update(1, updateBookDto, mockUser)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw NotFoundException when book does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateBookDto, mockUser)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should remove book when user owns it', async () => {
            mockRepository.findOne.mockResolvedValue(mockBook);
            mockRepository.remove.mockResolvedValue(mockBook);

            await service.remove(1, mockUser);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
        });

        it('should remove book when user is librarian', async () => {
            mockRepository.findOne.mockResolvedValue(mockBook);
            mockRepository.remove.mockResolvedValue(mockBook);

            await service.remove(1, mockLibrarian);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
        });

        it('should throw ForbiddenException when user does not own book', async () => {
            const otherUserBook = { ...mockBook, createdByUser: { id: 999, username: 'otheruser' } };
            mockRepository.findOne.mockResolvedValue(otherUserBook);

            await expect(service.remove(1, mockUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException when book does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999, mockUser)).rejects.toThrow(NotFoundException);
        });
    });
}); 