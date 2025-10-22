import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { OrderProcessor } from 'src/services/order.processor';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'orders_exchange',
          type: 'direct',
        },
      ],
      uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [OrderProcessor],
  exports: [RabbitMQModule],
})
export class RabbitMqModule {}
