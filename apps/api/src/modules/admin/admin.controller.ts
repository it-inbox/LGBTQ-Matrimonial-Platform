import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AdminService, AdminUsersQuery, InviteAdminDto } from "./admin.service.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";

type UserRole = "USER" | "MODERATOR" | "ADMIN";

@ApiTags("Admin Management")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Corporate email & password login for administrators and moderators" })
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.adminService.adminLogin(body.email, body.password);
  }

  @Get("stats")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get aggregated platform statistics and health metrics" })
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get("users")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get paginated, filterable, and searchable users directory" })
  async getUsers(@Query() query: AdminUsersQuery) {
    return this.adminService.getUsers(query);
  }

  @Get("users/:id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get detailed user profile, partner preference, and membership" })
  async getUserById(@Param("id") id: string) {
    return this.adminService.getUserById(id);
  }

  @Post("users/invite")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Provision and invite a new Administrator or Moderator account" })
  async inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.adminService.inviteAdmin(dto);
  }

  @Post("users/:id/revoke")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke administrative privileges and force-terminate all active sessions" })
  async revokeAdmin(@Param("id") id: string) {
    return this.adminService.revokeAdmin(id);
  }

  @Patch("users/:id/status")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ban or unban a user (toggle isActive)" })
  async updateUserStatus(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Patch("users/:id/role")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user role (USER, MODERATOR, ADMIN)" })
  async updateUserRole(
    @Param("id") id: string,
    @Body("role") role: UserRole
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch("users/:id/verify")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle profile verification badge (isVerified)" })
  async updateUserVerified(
    @Param("id") id: string,
    @Body("isVerified") isVerified: boolean
  ) {
    return this.adminService.updateUserVerified(id, isVerified);
  }

  @Post("dummy/purge")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Safely delete all generated dummy users and their cascaded data" })
  async purgeDummyUsers() {
    return this.adminService.purgeDummyUsers();
  }

  @Patch("memberships/:userId")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Manually grant or adjust user membership tier and duration" })
  async updateMembership(
    @Param("userId") userId: string,
    @Body() body: { tier: "FREE" | "PRO" | "PRO_MAX" | "PRO_SUPREME" | "PREMIER_LITE"; durationDays?: number }
  ) {
    return this.adminService.updateMembership(userId, body.tier, body.durationDays || 30);
  }
}
