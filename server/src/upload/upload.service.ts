import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      this.logger.debug(`Uploading single file: ${file.originalname}`);
      const url = await this.cloudinaryService.uploadImage(file);
      this.logger.debug(`File uploaded successfully: ${url}`);
      return { url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      this.logger.debug(`Uploading ${files.length} files`);
      
      // Upload files one by one to avoid rate limiting
      const urls: string[] = [];
      for (const file of files) {
        try {
          const url = await this.cloudinaryService.uploadImage(file);
          urls.push(url);
          this.logger.debug(`File uploaded successfully: ${url}`);
        } catch (error) {
          this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`);
          // Continue with other files even if one fails
        }
      }

      if (urls.length === 0) {
        throw new BadRequestException('Failed to upload any files');
      }

      this.logger.debug(`Successfully uploaded ${urls.length} files`);
      return { urls };
    } catch (error) {
      this.logger.error(`Failed to upload files: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload images to Cloudinary: ${error.message}`);
    }
  }
} 