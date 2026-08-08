import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export function normalizeStorageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(?:194\.233\.91\.132|localhost)(?::\d+)?/i, 'https://storage.alliago.id')
    .replace(/^http:\/\/storage\.alliago\.id/i, 'https://storage.alliago.id')
    .replace(/^http:\/\//i, 'https://');
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    let endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'storage.alliago.id');
    
    // Determine SSL configuration (default to true for storage.alliago.id)
    const secureEnv = this.configService.get<string>('MINIO_SECURE');
    const sslEnv = this.configService.get<string>('MINIO_USE_SSL') || this.configService.get<string>('MINIO_SSL');
    const useSSL = secureEnv !== undefined ? secureEnv === 'true' : (sslEnv !== undefined ? sslEnv === 'true' : true);

    let portDefault = useSSL ? '443' : '9000';
    let port = parseInt(this.configService.get<string>('MINIO_PORT', portDefault), 10);

    if (endPoint.includes(':')) {
      const parts = endPoint.split(':');
      endPoint = parts[0];
      port = parseInt(parts[1], 10);
    }

    // If useSSL is enabled but port is still set to 9000, override port to 443 to avoid ETIMEDOUT
    if (useSSL && port === 9000) {
      port = 443;
    }

    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 
                      this.configService.get<string>('MINIO_BUCKET', 'alliakids-new');

    const clientOpts: any = {
      endPoint,
      useSSL,
      accessKey,
      secretKey,
    };
    if (port) {
      clientOpts.port = port;
    }

    this.minioClient = new Minio.Client(clientOpts);

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

      const publicBaseUrl = this.configService.get<string>('MINIO_PUBLIC_URL', 'https://storage.alliago.id').replace(/\/+$/, '');
      const rawUrl = `${publicBaseUrl}/${this.bucketName}/${cleanFolder}/${filename}`;
      return normalizeStorageUrl(rawUrl);
    } catch (err: any) {
      this.logger.error(`Failed to upload file to MinIO: ${err.message}`, err.stack);
      throw err;
    }
  }
}
