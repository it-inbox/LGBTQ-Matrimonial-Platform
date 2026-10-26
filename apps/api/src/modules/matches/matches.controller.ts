import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MatchesService } from "./matches.service.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import {
  sendInterestSchema,
  respondInterestSchema,
  requestPhotoAccessSchema,
  SendInterestInput,
  RespondInterestInput,
  RequestPhotoAccessInput,
} from "@everpride/shared";

@ApiTags("Matches & Interactions")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Get("feed")
  @ApiOperation({ summary: "Get personalized discovery feed with photo privacy safeguards" })
  async getFeed(
    @CurrentUser("userId") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.matchesService.getFeed(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  @Post("interest")
  @ApiOperation({ summary: "Send interest to a prospective match" })
  async sendInterest(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(sendInterestSchema)) dto: SendInterestInput
  ) {
    return this.matchesService.sendInterest(userId, dto);
  }

  @Post("interest/:id/respond")
  @ApiOperation({ summary: "Accept or decline a received match interest" })
  async respondInterest(
    @CurrentUser("userId") userId: string,
    @Param("id") interestId: string,
    @Body(new ZodValidationPipe(respondInterestSchema)) dto: RespondInterestInput
  ) {
    return this.matchesService.respondInterest(userId, interestId, dto);
  }

  @Post("photo-access")
  @ApiOperation({ summary: "Request permission to unblur a member's private photos" })
  async requestPhotoAccess(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(requestPhotoAccessSchema)) dto: RequestPhotoAccessInput
  ) {
    return this.matchesService.requestPhotoAccess(userId, dto);
  }

  @Get("interests/received")
  @ApiOperation({ summary: "Get all received match interests" })
  async getReceivedInterests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getReceivedInterests(userId);
  }

  @Get("interests/sent")
  @ApiOperation({ summary: "Get all sent match interests" })
  async getSentInterests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getSentInterests(userId);
  }

  @Get("interests/declined")
  @ApiOperation({ summary: "Get all declined match interests (I Declined)" })
  async getDeclinedInterests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getDeclinedInterests(userId);
  }

  @Get("interests/they-declined")
  @ApiOperation({ summary: "Get all match interests declined by recipients (They Declined)" })
  async getTheyDeclinedInterests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getTheyDeclinedInterests(userId);
  }

  @Get("accepted")
  @ApiOperation({ summary: "Get all mutual accepted matches" })
  async getAcceptedMatches(@CurrentUser("userId") userId: string) {
    return this.matchesService.getAcceptedMatches(userId);
  }

  @Get("photo-access/received")
  @ApiOperation({ summary: "Get all received unblur photo requests" })
  async getReceivedPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getReceivedPhotoRequests(userId);
  }

  @Get("photo-access/sent")
  @ApiOperation({ summary: "Get all sent unblur photo requests" })
  async getSentPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getSentPhotoRequests(userId);
  }

  @Get("photo-access/i-accepted")
  @ApiOperation({ summary: "Get unblur photo requests I accepted" })
  async getIAcceptedPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getIAcceptedPhotoRequests(userId);
  }

  @Get("photo-access/they-accepted")
  @ApiOperation({ summary: "Get unblur photo requests they accepted" })
  async getTheyAcceptedPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getTheyAcceptedPhotoRequests(userId);
  }

  @Get("photo-access/i-declined")
  @ApiOperation({ summary: "Get unblur photo requests I declined" })
  async getIDeclinedPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getIDeclinedPhotoRequests(userId);
  }

  @Get("photo-access/they-declined")
  @ApiOperation({ summary: "Get unblur photo requests they declined" })
  async getTheyDeclinedPhotoRequests(@CurrentUser("userId") userId: string) {
    return this.matchesService.getTheyDeclinedPhotoRequests(userId);
  }

  @Post("photo-access/:id/respond")
  @ApiOperation({ summary: "Approve or decline an unblur photo request" })
  async respondPhotoAccess(
    @CurrentUser("userId") userId: string,
    @Param("id") requestId: string,
    @Body(new ZodValidationPipe(respondInterestSchema)) dto: RespondInterestInput
  ) {
    return this.matchesService.respondPhotoAccess(userId, requestId, dto);
  }
}
