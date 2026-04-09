import { Module } from '@nestjs/common';
import { BuildGateway } from './build.gateway';

@Module({ providers: [BuildGateway], exports: [BuildGateway] })
export class GatewayModule {}
