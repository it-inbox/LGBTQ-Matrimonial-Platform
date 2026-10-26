import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { db } from "@everpride/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client = db;

  async onModuleInit() {
    try {
      await this.client.$connect();
      console.log("[PrismaService] Connected to database successfully.");
    } catch (error) {
      console.warn(
        `[PrismaService] Warning: Could not connect to database on startup. Ensure PostgreSQL is running at the configured DATABASE_URL.\nError: ${(error as Error).message}`
      );
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
