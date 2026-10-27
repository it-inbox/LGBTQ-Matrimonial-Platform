import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import dotenv from "dotenv";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Increase body size limit to support image uploads (data URLs up to 25MB)
  app.useBodyParser("json", { limit: "25mb" });
  app.useBodyParser("urlencoded", { limit: "25mb", extended: true });

  app.enableCors({
    origin: (origin, callback) => {
      // Allow local dev frontends or requests without origin (curl/mobile/tools)
      callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("EverPride Matrimonial API")
    .setDescription("Inclusive, privacy-focused matrimonial platform API for the LGBTQ+ community")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[EverPride API] Server listening on http://localhost:${port}/api/v1`);
  console.log(`[EverPride API] Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
