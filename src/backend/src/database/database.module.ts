import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { createTypeOrmConfig } from './data-source';
import { SeederService } from './seeder.service';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: createTypeOrmConfig,
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Book, User]),
    ],
    providers: [SeederService],
    exports: [SeederService],
})
export class DatabaseModule { } 