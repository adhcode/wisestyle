import { toast } from 'react-hot-toast';

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast(message);
        break;
    }
  };

  return {
    showToast
  };
} 