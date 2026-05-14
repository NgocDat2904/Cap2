// Toast notification utility
// Wrapper để dễ thay đổi thư viện toast sau này

let toastImpl = null;

// Hàm khởi tạo toast implementation
export const initToast = (implementation) => {
  toastImpl = implementation;
};

// Toast types
export const toast = {
  success: (message, options = {}) => {
    if (toastImpl) {
      toastImpl.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } else {
      console.log('✅ SUCCESS:', message);
      alert(message); // Fallback
    }
  },

  error: (message, options = {}) => {
    if (toastImpl) {
      toastImpl.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } else {
      console.error('❌ ERROR:', message);
      alert(message); // Fallback
    }
  },

  warning: (message, options = {}) => {
    if (toastImpl) {
      toastImpl.warning(message, {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } else {
      console.warn('⚠️ WARNING:', message);
      alert(message); // Fallback
    }
  },

  info: (message, options = {}) => {
    if (toastImpl) {
      toastImpl.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } else {
      console.info('ℹ️ INFO:', message);
      alert(message); // Fallback
    }
  },

  // Cho confirm dialogs (vẫn dùng native confirm vì toast không có return value)
  confirm: (message) => {
    return window.confirm(message);
  },
};

export default toast;
