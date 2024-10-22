import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbit-mq.service';
import { FileTaskDto } from '../dto/file-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { MakeAndCopyFilesOutput } from '../interfaces/make-and-copy-files-output';

@Injectable()
export class BatchSenderService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async makeAndCopyFiles(fileTaskDto: FileTaskDto) {
    const { fileCount, fileSize, s3Destination } = fileTaskDto;
    const id = uuidv4();

    for (let i = 0; i < fileCount; i++) {
      this.rabbitMQService.sendToQueue(RabbitMQService.QUEUE_FILE, {
        id,
        fileSize,
        s3Destination,
      });
    }

    return id;
  }

  async getMakeAndCopyFilesTaskResult(
    fileTaskDto: FileTaskDto,
    id: string,
  ): Promise<MakeAndCopyFilesOutput> {
    const { fileCount } = fileTaskDto;
    let timeToCopyAllFiles = 0;
    let totalSize = 0;
    let totalRateOfCopy = 0;

    return new Promise(async (resolve) => {
      let counter = 0;
      for (let i = 0; i < fileCount; i++) {
        await this.rabbitMQService.consumeById(
          RabbitMQService.QUEUE_UPLOAD_RESULT,
          id,
          async (msg) => {
            const { uploadResult } = JSON.parse(msg.content.toString());
            timeToCopyAllFiles += uploadResult.timeToCopy;
            totalSize += uploadResult.totalSize;
            totalRateOfCopy += uploadResult.rateOfCopy;
            counter++;
            if (counter === fileCount) {
              const result: MakeAndCopyFilesOutput = {
                timeToCopyAllFiles,
                totalSize,
                rateOfCopy: totalRateOfCopy / fileCount,
                s3Location: uploadResult.s3Location,
              };
              resolve(result);
            }
          },
        );
      }
    });
  }
}
