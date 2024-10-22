import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class FileTaskDto {
  @IsInt()
  @Min(1)
  fileCount: number;

  @IsInt()
  @Min(1)
  fileSize: number; // Size in MB

  @IsString()
  @IsNotEmpty()
  s3Destination: string;
}
