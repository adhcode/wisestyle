import { apiClient } from '@/utils/api-client';

export const UploadService = {
    async uploadFile(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            return await apiClient.post('/api/upload/single', formData, true, {
                'Content-Type': 'multipart/form-data',
            });
        } catch (error) {
            console.error('Upload failed:', error);
            // Provide more helpful error message
            if (error instanceof Error && (error.message?.includes('Network Error') || error.message?.includes('ERR_FAILED'))) {
                throw new Error('Cannot connect to server. Please make sure the backend server is running on port 3001.');
            }
            throw error;
        }
    },

    async uploadMultipleFiles(files: File[]): Promise<{ urls: string[] }> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        try {
            return await apiClient.post('/api/upload/multiple', formData, true, {
                'Content-Type': 'multipart/form-data',
            });
        } catch (error) {
            console.error('Upload failed:', error);
            // Provide more helpful error message
            if (error instanceof Error && (error.message?.includes('Network Error') || error.message?.includes('ERR_FAILED'))) {
                throw new Error('Cannot connect to server. Please make sure the backend server is running on port 3001.');
            }
            throw error;
        }
    }
}; 