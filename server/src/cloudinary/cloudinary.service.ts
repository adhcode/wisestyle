import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);
    private readonly cloudName: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;

    constructor(private configService: ConfigService) {
        const cloudinaryUrl = this.configService.get('CLOUDINARY_URL');
        
        if (cloudinaryUrl) {
            this.logger.debug('Using CLOUDINARY_URL for configuration');
            cloudinary.config(cloudinaryUrl);
        } else {
            this.cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
            this.apiKey = this.configService.get('CLOUDINARY_API_KEY');
            this.apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

            if (!this.cloudName || !this.apiKey || !this.apiSecret) {
                this.logger.error('Cloudinary credentials are missing');
                throw new Error('Cloudinary credentials are missing');
            }

            this.logger.debug(`Configuring Cloudinary with cloud name: ${this.cloudName}`);
            
            cloudinary.config({
                cloud_name: this.cloudName,
                api_key: this.apiKey,
                api_secret: this.apiSecret,
                secure: true
            });
        }
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!file || !file.buffer) {
                reject(new Error('Invalid file or file buffer'));
                return;
            }

            this.logger.debug(`Uploading file: ${file.originalname}`);

            const timestamp = Math.floor(Date.now() / 1000);
            const params = {
                resource_type: 'auto' as const,
                folder: 'wisestyle',
                use_filename: true,
                unique_filename: true,
                overwrite: true,
                timestamp: timestamp
            };

            this.logger.debug(`Upload parameters: ${JSON.stringify(params)}`);

            const uploadStream = cloudinary.uploader.upload_stream(
                params,
                (error, result) => {
                    if (error) {
                        this.logger.error(`Cloudinary upload error: ${error.message}`, error);
                        reject(error);
                    } else {
                        this.logger.debug(`File uploaded successfully: ${result.secure_url}`);
                        resolve(result.secure_url);
                    }
                }
            );

            uploadStream.end(file.buffer);
        });
    }

    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        try {
            this.logger.debug(`Uploading ${files.length} files`);
            const uploadPromises = files.map(file => this.uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            this.logger.debug(`Successfully uploaded ${urls.length} files`);
            return urls;
        } catch (error) {
            this.logger.error(`Error uploading images: ${error.message}`, error.stack);
            throw error;
        }
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            this.logger.debug(`Deleting image: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
            this.logger.debug(`Image deleted successfully: ${publicId}`);
        } catch (error) {
            this.logger.error(`Error deleting image: ${error.message}`, error.stack);
            throw error;
        }
    }
} 