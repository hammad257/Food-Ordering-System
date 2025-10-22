import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { JwtAuthGuard } from 'src/common/jwt.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        const user = await this.usersService.create(dto);
        return { status: 'success', data: user };
    }


    @Throttle({ limit: 5, ttl: 60 }as any)
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return { status: 'success', data: req.user };
    }
}
