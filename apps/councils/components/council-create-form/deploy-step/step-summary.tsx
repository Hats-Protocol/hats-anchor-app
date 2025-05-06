import { SquarePen } from 'lucide-react';
import { BsCheckSquareFill, BsXSquareFill } from 'react-icons/bs';

interface StepSummaryProps {
  title: string;
  isCompleted: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}

export const StepSummary = ({ title, isCompleted, onEdit, children }: StepSummaryProps) => (
  <div className='flex items-start gap-6 border-b border-gray-200 pb-5 pt-3'>
    <div className='w-[160px] shrink-0 space-y-2'>
      <h3 className='text-l font-medium text-gray-900'>{title}</h3>
      <div className='flex items-center gap-1'>
        {isCompleted ? (
          <>
            <BsCheckSquareFill className='text-functional-success h-4 w-4' />
            <span className='text-functional-success text-sm font-medium'>Ready</span>
          </>
        ) : (
          <>
            <BsXSquareFill className='text-functional-error h-4 w-4' />
            <span className='text-functional-error text-sm font-medium'>Incomplete</span>
          </>
        )}
      </div>
    </div>

    <div className='min-w-0 flex-1'>{children}</div>

    {onEdit && (
      <div className='w-[100px] shrink-0 text-right'>
        <button
          type='button'
          className='text-functional-link-primary hover:text-functional-link-primary/60 inline-flex items-center gap-2'
          onClick={onEdit}
        >
          <SquarePen className='h-4 w-4' />
          <span className='text-sm font-medium'>Edit</span>
        </button>
      </div>
    )}
  </div>
);
