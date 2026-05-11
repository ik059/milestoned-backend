import { Module } from '@nestjs/common';
import { UserServices } from './users.service';

@Module({
  providers: [UserServices],
  exports: [UserServices],
})
export class UserModule {}
