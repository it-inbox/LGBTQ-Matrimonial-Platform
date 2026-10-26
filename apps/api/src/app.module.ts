import { Module } from "@nestjs/common";
import { PrismaModule } from "./modules/prisma/prisma.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ProfilesModule } from "./modules/profiles/profiles.module.js";
import { MatchesModule } from "./modules/matches/matches.module.js";
import { ChatModule } from "./modules/chat/chat.module.js";

@Module({
  imports: [PrismaModule, AuthModule, ProfilesModule, MatchesModule, ChatModule],
})
export class AppModule {}

