import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from 'ui';

const NumberInputSteppers = ({ stepUp, stepDown, upDisabled, downDisabled }: NumberInputSteppersProps) => {
  return (
    <div className='ml-[-1px] flex h-9 flex-col items-center rounded-r-md border border-gray-200 bg-gray-50'>
      <div
        className={cn(
          'flex h-1/2 w-full cursor-pointer items-center justify-center border-b border-gray-200',
          upDisabled && 'bg-gray-200 text-gray-400',
        )}
        onClick={stepUp}
        aria-disabled={upDisabled}
      >
        <ChevronUp className='h-3' />
      </div>
      <div
        className={cn(
          'flex h-1/2 w-full cursor-pointer items-center justify-center',
          downDisabled && 'bg-gray-200 text-gray-400',
        )}
        onClick={stepDown}
        aria-disabled={downDisabled}
      >
        <ChevronDown className='h-3' />
      </div>
    </div>
  );
};

interface NumberInputSteppersProps {
  stepUp: () => void;
  stepDown: () => void;
  upDisabled: boolean;
  downDisabled: boolean;
}

export { NumberInputSteppers };
