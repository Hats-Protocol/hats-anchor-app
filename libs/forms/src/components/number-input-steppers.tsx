import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from 'ui';

const NumberInputSteppers = ({ stepUp, stepDown, upDisabled, downDisabled }: NumberInputSteppersProps) => {
  const handleStepUp = () => {
    if (!upDisabled) {
      stepUp();
    }
  };

  const handleStepDown = () => {
    if (!downDisabled) {
      stepDown();
    }
  };

  return (
    <div className='ml-[-1px] flex h-9 flex-col items-center rounded-r-md border border-gray-200 bg-gray-100'>
      <div
        className={cn(
          'flex h-1/2 w-full items-center justify-center',
          upDisabled ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'cursor-pointer',
        )}
        onClick={handleStepUp}
        aria-disabled={upDisabled}
      >
        <ChevronUp className='h-3' />
      </div>
      <div
        className={cn(
          'flex h-1/2 w-full items-center justify-center',
          downDisabled ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'cursor-pointer',
        )}
        onClick={handleStepDown}
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
