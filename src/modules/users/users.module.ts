import { Module } from '@nestjs/common';
import { UsersController } from 'src/controllers/users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/services/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
