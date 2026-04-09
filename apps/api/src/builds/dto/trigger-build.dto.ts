import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BuildProfile {
  development = 'development',
  preview = 'preview',
  production = 'production',
}

export class TriggerBuildDto {
  @ApiProperty({ example: 'project-uuid' })
  @IsString()
  projectId: string;

  @ApiProperty({ enum: BuildProfile, example: 'production' })
  @IsEnum(BuildProfile)
  profile: BuildProfile;

  @ApiPropertyOptional({ example: 'main' })
  @IsOptional()
  @IsString()
  gitRef?: string;

  @ApiPropertyOptional({ example: 'abc1234' })
  @IsOptional()
  @IsString()
  gitCommit?: string;
}
