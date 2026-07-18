import { Controller, Get, Post, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { MinioService } from '../shared/minio.service';

@Controller('invoice')
export class InvoicesPublicController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.invoicesService.findByToken(token);
  }
}

@Controller('invoices/me')
@UseGuards(JwtAuthGuard)
export class InvoicesClientController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  async getMyInvoices(@Request() req: any) {
    const whatsapp = req.user.whatsapp;
    const email = req.user.email || null;
    return this.invoicesService.findMyInvoices(whatsapp, email);
  }

  @Post(':id/upload-proof')
  @UseInterceptors(
    FileInterceptor('payment_proof', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
          return cb(new BadRequestException('Format file harus berupa gambar (jpg, jpeg, png) atau PDF!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File bukti pembayaran tidak boleh kosong!');
    }
    const whatsapp = req.user.whatsapp;
    const email = req.user.email || null;
    
    // Generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `proof-${uniqueSuffix}${extname(file.originalname)}`;
    
    // Upload to MinIO
    const fileUrl = await this.minioService.uploadFile('proofs', filename, file.buffer, file.mimetype);
    
    return this.invoicesService.uploadPaymentProof(Number(id), fileUrl, whatsapp, email);
  }
}
