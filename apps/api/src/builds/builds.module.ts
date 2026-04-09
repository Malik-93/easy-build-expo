import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BuildsController } from './builds.controller';
import { BuildsService, BUILD_QUEUE } from './builds.service';
import { BuildProcessor } from './processors/build.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: parseInt(config.get('REDIS_PORT') || '6379'),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue({ name: BUILD_QUEUE }),
  ],
  controllers: [BuildsController],
  providers: [BuildsService, BuildProcessor],
  exports: [BuildsService],
})
export class BuildsModule {}
