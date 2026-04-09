import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CredentialsService {
  private encKey: string;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.encKey = this.config.get<string>('ENCRYPTION_KEY') || 'default-key-32chars-padded-here!!';
  }

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encKey).toString();
  }

  private decrypt(data: string): string {
    const bytes = CryptoJS.AES.decrypt(data, this.encKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async uploadKeystore(projectId: string, userId: string, dto: any) {
    await this.verifyOwner(projectId, userId);
    const encrypted = this.encrypt(dto.keystoreBase64);
    return this.prisma.credential.create({
      data: {
        projectId,
        label: dto.label,
        encryptedKeystore: encrypted,
        keyAlias: dto.keyAlias,
      },
    });
  }

  async findAll(projectId: string, userId: string) {
    await this.verifyOwner(projectId, userId);
    return this.prisma.credential.findMany({
      where: { projectId },
      select: { id: true, label: true, keyAlias: true, createdAt: true },
    });
  }

  async remove(id: string, userId: string) {
    const cred = await this.prisma.credential.findUnique({ where: { id } });
    if (!cred) throw new Error('Credential not found');
    await this.verifyOwner(cred.projectId, userId);
    return this.prisma.credential.delete({ where: { id } });
  }

  private async verifyOwner(projectId: string, userId: string) {
    const p = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!p) throw new Error('Project not found or access denied');
  }
}
