'use client';

import React, { useState, useEffect } from 'react';

interface CustomAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  type, 
  message, 
  duration = 5000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className={`alert ${getTypeStyles()}`}>
      <span>{message}</span>
      <button 
        className="close-btn"
        onClick={handleClose}
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  );
};

export default CustomAlert;