import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { cn } from '../../lib/utils';

/**
 * AlertModal - Custom modal for showing alerts/notifications
 * @param {string} type - 'success', 'error', or 'info'
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {function} onClose - Callback when modal is closed
 * @param {string} confirmText - Text for confirm button (default: "OK")
 */
const AlertModal = ({ type = 'info', title, message, onClose, confirmText = 'OK' }) => {
  const iconConfig = {
    success: {
      icon: <FaCheckCircle size={48} />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    error: {
      icon: <FaExclamationCircle size={48} />,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    info: {
      icon: <FaInfoCircle size={48} />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  };

  const config = iconConfig[type] || iconConfig.info;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center space-y-4">
          <div className={cn(
            "rounded-full p-4 w-fit mx-auto",
            config.bgColor
          )}>
            <div className={config.color}>
              {config.icon}
            </div>
          </div>

          {title && (
            <AlertDialogTitle className="text-2xl">
              {title}
            </AlertDialogTitle>
          )}

          <AlertDialogDescription className="text-base text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={onClose}
            className={cn(
              "min-w-[120px]",
              type === 'error' && "bg-red-600 hover:bg-red-700",
              type === 'success' && "bg-green-600 hover:bg-green-700"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertModal;
