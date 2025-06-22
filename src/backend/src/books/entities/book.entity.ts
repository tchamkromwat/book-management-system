import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

    @ApiProperty({ description: 'User who created this book' })
    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'created_by_user_id' })
    createdByUser: User;

    @ApiProperty({ description: 'Creation timestamp' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Update timestamp' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 