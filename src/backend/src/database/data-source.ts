import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';

// For migrations and CLI commands
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'book_management',
    entities: [Book, User],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false, // Use migrations in production
    logging: process.env.NODE_ENV === 'development',
});

// For NestJS module configuration
export const createTypeOrmConfig = (configService: ConfigService) => ({
    type: 'postgres' as const,
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [Book, User],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
}); 