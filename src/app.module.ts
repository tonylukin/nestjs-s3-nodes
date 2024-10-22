import { Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { RabbitMQService } from './services/rabbit-mq.service';
import { FileTaskController } from './controllers/file-task.controller';
import { WorkerService } from './services/worker.service';
import { BatchSenderService } from './services/batch-sender.service';

@Module({
  imports: [],
  controllers: [FileTaskController],
  providers: [S3Service, RabbitMQService, WorkerService, BatchSenderService],
})
export class AppModule {}
