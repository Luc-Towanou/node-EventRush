import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // await app.listen(port ?? 3000, '0.0.0.0');
  console.log(`🚀 Server running on port ${port || 3000}`);
}
bootstrap();
