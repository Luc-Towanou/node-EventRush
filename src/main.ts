import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajout de l’interceptor global
  app.useGlobalInterceptors(new BigIntInterceptor()); 

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('EventRush API')
    .setDescription('Documentation de l’API EventRush')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Veuillez entrer le token Sanctum ici (sans le mot Bearer).',
      },
      'sanctumAuth', // Nom du schéma
    )// si tu utilises JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Listening on ${port}`);

   
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
