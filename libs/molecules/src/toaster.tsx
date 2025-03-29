'use client';

import { useToast } from 'hooks';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from 'ui';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className='z-[100]'>
            <div className='grid gap-1'>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className='z-[100]' />
    </ToastProvider>
  );
}
