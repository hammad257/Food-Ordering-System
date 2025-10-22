import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cluster: any = require('cluster');
const os = require('os');

async function bootstrap() {
  const numCPUs = os.cpus().length;

  if (cluster.isMaster) { 
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker: any, code: number, signal: string) => {
      console.log(`Worker ${worker.process.pid} died. Forking a new one.`);
      cluster.fork();
    });
  } else {
    // Worker processes
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`Worker ${process.pid} listening on port ${port}`);
  }
}

bootstrap();
