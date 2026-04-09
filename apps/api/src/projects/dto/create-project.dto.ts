import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'my-android-app' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'com.mycompany.myapp' })
  @IsOptional()
  @IsString()
  packageName?: string;

  @ApiPropertyOptional({ example: 'https://github.com/org/repo' })
  @IsOptional()
  @IsString()
  githubRepo?: string;

  @ApiPropertyOptional({ example: 'org-slug' })
  @IsOptional()
  @IsString()
  orgId?: string;
}
