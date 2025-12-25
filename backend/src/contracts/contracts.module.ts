import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { DatabaseModule } from '../database';
import { ExtractionModule } from '../extraction';
import { PaymentModule } from '../payment';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    DatabaseModule,
    ExtractionModule,
    PaymentModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
