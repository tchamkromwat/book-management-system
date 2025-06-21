import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @ApiProperty({ description: 'User ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Username' })
    @Column({ unique: true, length: 50 })
    username: string;

    @ApiProperty({ description: 'User email' })
    @Column({ unique: true, length: 255, nullable: true })
    email: string;

    @Column({ length: 255, name: 'password_hash' })
    password_hash: string;

    @ApiProperty({ description: 'First name' })
    @Column({ length: 100, name: 'first_name', nullable: true })
    first_name: string;

    @ApiProperty({ description: 'Last name' })
    @Column({ length: 100, name: 'last_name', nullable: true })
    last_name: string;

    @ApiProperty({ description: 'User role' })
    @Column({ length: 50, default: 'user' })
    role: string;

    @ApiProperty({ description: 'Account status' })
    @Column({ default: true, name: 'is_active' })
    is_active: boolean;

    @ApiProperty({ description: 'Creation timestamp' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Update timestamp' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 