import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { InterventionTypesController } from './intervention-types.controller';
import { InterventionTypesService } from './intervention-types.service';

@Module({
  imports: [PrismaModule],
  controllers: [InterventionTypesController],
  providers: [InterventionTypesService],
  exports: [InterventionTypesService],
})
export class InterventionTypesModule {}

