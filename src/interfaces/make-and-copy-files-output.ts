export interface MakeAndCopyFilesOutput {
  timeToCopyAllFiles: number;
  totalSize: number;
  rateOfCopy: number;
  s3Location: string;
}
