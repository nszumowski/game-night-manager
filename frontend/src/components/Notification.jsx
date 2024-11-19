import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const Notification = () => {
  const { notification } = useNotification();

  if (!notification.message) return null;

  return (
    <div 
      className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
        notification.type === 'error' 
          ? 'bg-red-500 text-white' 
          : 'bg-green-500 text-white'
      }`}
      role="alert"
    >
      {notification.message}
    </div>
  );
};

export default Notification; 