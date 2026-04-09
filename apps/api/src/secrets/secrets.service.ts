import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SecretsService {
  private encKey: string;
  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.encKey = this.config.get<string>('ENCRYPTION_KEY') || 'default-key-32chars-padded-here!!';
  }

  private encrypt = (v: string) => CryptoJS.AES.encrypt(v, this.encKey).toString();
  private decrypt = (v: string) => CryptoJS.AES.decrypt(v, this.encKey).toString(CryptoJS.enc.Utf8);

  async create(projectId: string, userId: string, dto: { key: string; value: string; profile?: string }) {
    await this.verifyOwner(projectId, userId);
    return this.prisma.secret.upsert({
      where: { projectId_key_profile: { projectId, key: dto.key, profile: dto.profile || null } },
      create: { projectId, key: dto.key, encryptedValue: this.encrypt(dto.value), profile: dto.profile },
      update: { encryptedValue: this.encrypt(dto.value) },
    });
  }

  async findAll(projectId: string, userId: string) {
    await this.verifyOwner(projectId, userId);
    const secrets = await this.prisma.secret.findMany({ where: { projectId } });
    return secrets.map((s) => ({ ...s, value: this.decrypt(s.encryptedValue), encryptedValue: undefined }));
  }

  async remove(id: string, userId: string) {
    const s = await this.prisma.secret.findUnique({ where: { id } });
    if (!s) throw new Error('Secret not found');
    await this.verifyOwner(s.projectId, userId);
    return this.prisma.secret.delete({ where: { id } });
  }

  private async verifyOwner(projectId: string, userId: string) {
    const p = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!p) throw new Error('Access denied');
  }
}
