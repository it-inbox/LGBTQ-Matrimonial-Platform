import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { SmsService } from "./sms.service.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, SmsService],
  exports: [AuthService, SmsService],
})
export class AuthModule {}
