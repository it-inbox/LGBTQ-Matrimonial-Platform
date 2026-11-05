import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PaymentsModule } from "../payments/payments.module.js";

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

