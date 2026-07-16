import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    let endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    let port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);

    if (endPoint.includes(':')) {
      const parts = endPoint.split(':');
      endPoint = parts[0];
      port = parseInt(parts[1], 10);
    }

    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    
    const useSSL = this.configService.get<string>('MINIO_SECURE', 'false') === 'true' || 
                   this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 
                      this.configService.get<string>('MINIO_BUCKET', 'alliakids');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log(`MinIO Client initialized for endpoint: ${endPoint}:${port}, bucket: ${this.bucketName}, useSSL: ${useSSL}`);

    // Ensure bucket exists and has public policy
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        this.logger.log(`Creating bucket: ${this.bucketName}`);
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
      
      this.logger.log(`Setting public read policy for bucket: ${this.bucketName}`);
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log(`Bucket policy set to public-read successfully.`);
    } catch (err: any) {
      this.logger.warn(`Could not verify or set bucket policy: ${err.message}. Please verify bucket permissions manually in MinIO dashboard if access is denied.`);
    }
  }

  async uploadFile(folder: string, filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      const objectName = cleanFolder ? `${cleanFolder}/${filename}` : filename;

      // Put object
      await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, {
        'Content-Type': mimeType,
      });

      this.logger.log(`Uploaded file ${objectName} to bucket ${this.bucketName}`);

      // Return the public URL
      let endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      let port = this.configService.get<string>('MINIO_PORT', '9000');
      
      if (endPoint.includes(':')) {
        const parts = endPoint.split(':');
        endPoint = parts[0];
        port = parts[1];
      }

      const useSSL = this.configService.get<string>('MINIO_SECURE', 'false') === 'true' || 
                     this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
      const protocol = useSSL ? 'https' : 'http';
      
      return `${protocol}://${endPoint}:${port}/${this.bucketName}/${cleanFolder}/${filename}`;
    } catch (err: any) {
      this.logger.error(`Failed to upload file to MinIO: ${err.message}`, err.stack);
      throw err;
    }
  }
}
