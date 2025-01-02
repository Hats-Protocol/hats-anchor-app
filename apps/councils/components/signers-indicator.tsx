import { map } from 'lodash';

export const SignersIndicator = ({ threshold, signers }: SignersIndicatorProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        {map(Array.from({ length: signers || 7 }), (_, index) => (
          <div key={index} className={`h-2 w-12 rounded-full ${index < threshold ? 'bg-green-700' : 'bg-gray-700'}`} />
        ))}
      </div>

      <p>
        {threshold} confirmations required of {signers} council members
      </p>
    </div>
  );
};

interface SignersIndicatorProps {
  threshold: number;
  signers: number;
}
