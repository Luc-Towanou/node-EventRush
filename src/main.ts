import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Listening on ${port}`);

   // Ajout de l’interceptor global
  app.useGlobalInterceptors(new BigIntInterceptor()); 
}
bootstrap();
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const port = parseInt(process.env.PORT || '10000', 10);
//   await app.listen(port, '0.0.0.0');

//   // await app.listen(port ?? 3000, '0.0.0.0');
//   console.log(`🚀 Server running on port ${port}`);
// }
// bootstrap(); 
