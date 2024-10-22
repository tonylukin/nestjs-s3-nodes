import { Injectable } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import * as fs from 'fs-extra';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },

      region: process.env.AWS_REGION,
    });
  }

  async uploadFileToS3(filePath: string, s3Destination: string): Promise<any> {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${s3Destination}/${uuid()}`,
      Body: fileContent,
    };

    const data = await new Upload({
      client: this.s3,
      params,
    }).done();
    return data.Location; // S3 URL
  }
}
