import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { SmsService } from "./sms.service.js";
import { PaymentsModule } from "../payments/payments.module.js";

@Module({
  imports: [PaymentsModule],
  controllers: [AuthController],
  providers: [AuthService, SmsService],
  exports: [AuthService, SmsService],
})
export class AuthModule {}
