import { isNumber, map } from 'lodash';

const SignerIndicator = ({
  index,
  threshold,
  signers,
}: {
  index: number; // 1-indexed
  threshold: number | undefined;
  signers: number | undefined;
}) => {
  if (!isNumber(signers) || !isNumber(threshold)) return null;

  if (signers < index) {
    if (index <= threshold) {
      // required signer to complete a tx
      return <div className='h-1.5 w-14 rounded-full border border-green-700 md:h-2 md:w-12' />;
    }

    // ancillary signer
    return <div className='h-1.5 w-14 rounded-full border border-gray-700 md:h-2 md:w-12' />;
  }

  if (index <= threshold) {
    // active signer
    return <div className='h-1.5 w-14 rounded-full bg-green-700 md:h-2 md:w-12' />;
  }

  // inactive signer
  return <div className='h-1.5 w-14 rounded-full bg-gray-700 md:h-2 md:w-12' />;
};

const SignersIndicator = ({ threshold, signers, maxSigners }: SignersIndicatorProps) => {
  if (!isNumber(threshold) || !isNumber(signers) || !isNumber(maxSigners)) return null;
  // TODO better loading state

  return (
    <div className='flex w-full flex-col gap-1.5 md:w-fit md:gap-2'>
      <div className='flex w-full justify-center gap-1 md:mx-auto md:w-fit md:items-center md:gap-2 lg:max-w-[600px] xl:max-w-[800px]'>
        {map(Array.from({ length: maxSigners }), (_, index) => (
          <SignerIndicator key={index} index={index + 1} threshold={threshold} signers={signers} />
        ))}
      </div>

      {signers > threshold ? (
        <p className='text-center text-sm md:text-base'>
          {threshold} confirmation{threshold > 1 ? 's' : ''} required of {signers} council members
        </p>
      ) : (
        <p className='text-center text-sm md:text-base'>
          {signers > 0 ? `${signers} out` : 'None'} of {maxSigners} council members have joined
        </p>
      )}
    </div>
  );
};

interface SignersIndicatorProps {
  threshold: number | undefined;
  signers: number | undefined;
  maxSigners: number | undefined;
}

export { SignersIndicator };
