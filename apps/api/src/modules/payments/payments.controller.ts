import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService, CreateCheckoutSessionDto, CompletePaymentDto } from "./payments.service.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";

@ApiTags("Payments & Subscriptions")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("membership")
  @ApiOperation({ summary: "Get current user membership & entitlements" })
  getMembership(@CurrentUser("userId") userId: string) {
    return this.paymentsService.getMembership(userId);
  }

  @Post("create-checkout-session")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create checkout session (Live Stripe or Dev Simulator)" })
  async createCheckoutSession(
    @CurrentUser("userId") userId: string,
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.paymentsService.createCheckoutSession(userId, dto);
  }

  @Post("complete-simulation")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Complete simulated payment and activate membership perks" })
  async completeSimulation(
    @CurrentUser("userId") userId: string,
    @Body() dto: CompletePaymentDto
  ) {
    return this.paymentsService.completeSimulatedPayment(userId, dto);
  }
}
