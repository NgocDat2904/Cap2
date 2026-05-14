// Toast notification utility using Sonner
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message, options = {}) => {
    sonnerToast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    sonnerToast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    sonnerToast.warning(message, {
      duration: 3500,
      ...options,
    });
  },

  info: (message, options = {}) => {
    sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  // Cho confirm dialogs (vẫn dùng native confirm vì toast không có return value)
  confirm: (message) => {
    return window.confirm(message);
  },
};

export default toast;
