import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ProfilesService } from "./profiles.service.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import {
  createProfileSchema,
  updateProfileSchema,
  updatePrivacySettingsSchema,
  CreateProfileInput,
  UpdateProfileInput,
  UpdatePrivacySettingsInput,
} from "@everpride/shared";

@ApiTags("Profiles")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  async getMyProfile(@CurrentUser("userId") userId: string) {
    return this.profilesService.getMyProfile(userId);
  }

  @Post()
  @ApiOperation({ summary: "Create initial user profile" })
  async createProfile(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(createProfileSchema)) dto: CreateProfileInput
  ) {
    return this.profilesService.createProfile(userId, dto);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update profile details" })
  async updateProfile(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileInput
  ) {
    return this.profilesService.updateProfile(userId, dto);
  }

  @Patch("me/privacy")
  @ApiOperation({ summary: "Update privacy toggles (photo visibility & ghost mode)" })
  async updatePrivacy(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(updatePrivacySettingsSchema)) dto: UpdatePrivacySettingsInput
  ) {
    return this.profilesService.updatePrivacy(userId, dto);
  }
}
