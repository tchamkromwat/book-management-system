import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';

interface SampleData {
    users: Array<{
        username: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role: string;
        is_active: boolean;
    }>;
    books: Array<{
        title: string;
        author: string;
        published_year: number;
        genre: string;
    }>;
}

@Injectable()
export class SeederService {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async seed(): Promise<void> {
        try {
            const sampleData = this.loadSampleData();
            await this.seedUsers(sampleData.users);
            await this.seedBooks(sampleData.books);
            this.logger.log('Database seeding completed successfully');
        } catch (error) {
            this.logger.error('Database seeding failed', error);
            throw error;
        }
    }

    private loadSampleData(): SampleData {
        // Try multiple possible paths for the sample.json file
        const possiblePaths = [
            path.join(__dirname, 'sample.json'), // dist/database/sample.json
            path.join(__dirname, '..', '..', 'src', 'database', 'sample.json'), // from dist back to src
            path.join(process.cwd(), 'src', 'database', 'sample.json'), // absolute from project root
            path.join(process.cwd(), 'dist', 'database', 'sample.json'), // absolute dist path
        ];

        let jsonData: string | undefined;
        let usedPath: string;

        for (const jsonPath of possiblePaths) {
            try {
                if (fs.existsSync(jsonPath)) {
                    jsonData = fs.readFileSync(jsonPath, 'utf8');
                    usedPath = jsonPath;
                    this.logger.log(`Successfully loaded sample data from: ${usedPath}`);
                    break;
                }
            } catch (error) {
                // Continue to next path
                continue;
            }
        }

        if (!jsonData) {
            this.logger.error('Failed to find sample.json file in any of the expected locations:', possiblePaths);
            throw new Error('Could not load sample data - file not found');
        }

        try {
            return JSON.parse(jsonData);
        } catch (error) {
            this.logger.error('Failed to parse sample data JSON', error);
            throw new Error('Could not parse sample data JSON');
        }
    }

    private async seedUsers(users: SampleData['users']): Promise<void> {
        const userCount = await this.userRepository.count();
        if (userCount > 0) {
            this.logger.log('Users already exist, skipping user seeding');
            return;
        }

        const saltRounds = 10;
        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password_hash: await bcrypt.hash(user.password, saltRounds),
                password: undefined, // Remove plain password
            }))
        );

        // Remove the password field completely
        const usersToSave = usersWithHashedPasswords.map(({ password, ...user }) => user);

        await this.userRepository.save(usersToSave);
        this.logger.log(`Seeded ${usersToSave.length} users`);
    }

    private async seedBooks(books: SampleData['books']): Promise<void> {
        const bookCount = await this.bookRepository.count();
        if (bookCount > 0) {
            this.logger.log('Books already exist, skipping book seeding');
            return;
        }

        await this.bookRepository.save(books);
        this.logger.log(`Seeded ${books.length} books`);
    }
} 