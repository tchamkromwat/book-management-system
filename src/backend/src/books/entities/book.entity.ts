import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('books')
export class Book {
    @ApiProperty({ description: 'Book ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Book title' })
    @Column({ length: 255 })
    title: string;

    @ApiProperty({ description: 'Book author' })
    @Column({ length: 255 })
    author: string;

    @ApiProperty({ description: 'Publication year' })
    @Column({ type: 'integer', nullable: true })
    published_year: number;

    @ApiProperty({ description: 'Book genre' })
    @Column({ length: 100, nullable: true })
    genre: string;

    @ApiProperty({ description: 'Creation timestamp' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Update timestamp' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 