import { apiClient } from '@/utils/api-client';

export const UploadService = {
    async uploadFile(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        
        return apiClient.post('/api/upload/single', formData, true, {
            'Content-Type': 'multipart/form-data',
        });
    },

    async uploadMultipleFiles(files: File[]): Promise<{ urls: string[] }> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        return apiClient.post('/api/upload/multiple', formData, true, {
            'Content-Type': 'multipart/form-data',
        });
    }
}; 