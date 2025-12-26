import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma } from '../../generated/prisma/browser';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    try {
      const connectionString = configService.get<string>('DATABASE_URL');
      const adapter = new PrismaPg({ connectionString });

      super({
        adapter,
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'error' },
        ],
      });

      (this as any).$on('query', (e: Prisma.QueryEvent) => {
        console.log(`[QUERY] ${e.query}`);
      });

      (this as any).$on('info', (e: Prisma.QueryEvent) => {
        console.log(`[INFO] ${e.query}`);
      });

      (this as any).$on('warn', (e: Prisma.QueryEvent) => {
        console.log(`[WARN] ${e.query}`);
      });

      (this as any).$on('error', (e: Prisma.QueryEvent) => {
        console.log(`[ERROR] ${e.query}`);
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to load database configuration: ${err.message}`,
      );
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
