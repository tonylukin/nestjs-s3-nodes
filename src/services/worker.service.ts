import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbit-mq.service';
import { S3Service } from './s3.service';
import * as fs from 'fs-extra';
import { performance } from 'perf_hooks';
import cluster from 'cluster';
import { MakeAndCopySingleFileOutput } from '../interfaces/make-and-copy-single-file-output';

@Injectable()
export class WorkerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly s3Service: S3Service,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.connect();
    if (process.env.IS_WORKER === '0') {
      console.log('Is not worker. Exit');
      return;
    }

    if (cluster.isPrimary) {
      for (let i = 0; i < Number(process.env.WORKERS_COUNT); i++) {
        cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died [${code} ${signal}]`);
        });
      }
    } else {
      this.rabbitMQService.consume(RabbitMQService.QUEUE_FILE, async (msg) => {
        const { id, fileSize, s3Destination } = JSON.parse(
          msg.content.toString(),
        );
        const uploadResult = await this.processFile(fileSize, s3Destination);

        await this.rabbitMQService.sendToQueue(
          RabbitMQService.QUEUE_UPLOAD_RESULT,
          {
            messageId: id,
            uploadResult,
          },
        );
      });
    }
  }

  async processFile(
    fileSize: number,
    s3Destination: string,
  ): Promise<MakeAndCopySingleFileOutput> {
    const filePath = `./tmp/${Date.now()}.txt`;
    const startTime = performance.now();
    const buffer = Buffer.alloc(fileSize * 1024 * 1024, 'A');
    await fs.outputFile(filePath, buffer);

    const s3Location = await this.s3Service.uploadFileToS3(
      filePath,
      s3Destination,
    );

    const endTime = performance.now();
    const timeToCopy = (endTime - startTime) / 1000;
    const totalSize = fileSize;
    const outputData: MakeAndCopySingleFileOutput = {
      timeToCopy,
      totalSize,
      rateOfCopy: totalSize / timeToCopy,
      s3Location,
    };

    console.log(outputData);

    // Cleanup
    fs.remove(filePath);

    return outputData;
  }
}
