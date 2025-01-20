import { ReactNode } from 'react';
import { cn } from 'ui';

const FormRowWrapper = ({ noMargin, children }: FormRowWrapperProps) => {
  return <div className={cn('flex flex-col gap-4', noMargin ? 'ml-0' : '-ml-6')}>{children}</div>;
};

interface FormRowWrapperProps {
  noMargin?: boolean;
  children: ReactNode;
}

export { FormRowWrapper, type FormRowWrapperProps };
