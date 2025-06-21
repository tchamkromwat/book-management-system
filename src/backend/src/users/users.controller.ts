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
    Post
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({
        status: 201,
        description: 'User has been successfully created.',
        type: User,
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 409, description: 'User already exists.' })
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully.',
        type: [User],
    })
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully.',
        type: User,
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User has been successfully updated.',
        type: User,
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update user password' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
    @ApiResponse({ status: 204, description: 'Password has been successfully updated.' })
    @ApiResponse({ status: 400, description: 'Current password is incorrect.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async updatePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePasswordDto: UpdateUserPasswordDto,
    ): Promise<void> {
        return this.usersService.updatePassword(id, updatePasswordDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
    @ApiResponse({ status: 204, description: 'User has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.usersService.remove(id);
    }
} 