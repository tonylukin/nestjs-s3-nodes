import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileTaskDto } from '../dto/file-task.dto';
import { BatchSenderService } from '../services/batch-sender.service';

@Controller('file-task')
export class FileTaskController {
  constructor(private readonly batchSenderService: BatchSenderService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createFileTask(@Body() fileTaskDto: FileTaskDto) {
    const id = await this.batchSenderService.makeAndCopyFiles(fileTaskDto);

    const { timeToCopyAllFiles, totalSize, rateOfCopy } =
      await this.batchSenderService.getMakeAndCopyFilesTaskResult(
        fileTaskDto,
        id,
      );

    return {
      timeToCopyAllFiles: timeToCopyAllFiles.toFixed(6),
      rateOfCopy: `${rateOfCopy.toFixed(2)} MB/s`,
      totalSize,
    };
  }
}
