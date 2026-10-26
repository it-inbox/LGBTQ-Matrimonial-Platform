import { Module } from "@nestjs/common";
import { MatchesService } from "./matches.service.js";
import { MatchesController } from "./matches.controller.js";
import { ChatModule } from "../chat/chat.module.js";

@Module({
  imports: [ChatModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
