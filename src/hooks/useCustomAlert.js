import { useState } from 'react';

const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = ({
    title,
    message,
    type = 'info',
    showCancel = false,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Convenience methods
  const showSuccess = (title, message, options = {}) => {
    showAlert({ title, message, type: 'success', ...options });
  };

  const showError = (title, message, options = {}) => {
    showAlert({ title, message, type: 'error', ...options });
  };

  const showWarning = (title, message, options = {}) => {
    showAlert({ title, message, type: 'warning', ...options });
  };

  const showInfo = (title, message, options = {}) => {
    showAlert({ title, message, type: 'info', ...options });
  };

  const showConfirm = (title, message, onConfirm, options = {}) => {
    showAlert({
      title,
      message,
      type: 'warning',
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm,
      ...options,
    });
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};

export default useCustomAlert;
