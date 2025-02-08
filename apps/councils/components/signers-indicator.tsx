import { isNumber, map } from 'lodash';
// bg-gray-700
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
      return <div className='h-2 w-12 rounded-full border border-green-700' />;
    }

    // ancillary signer
    return <div className='h-2 w-12 rounded-full border border-gray-700' />;
  }

  if (index <= threshold) {
    // active signer
    return <div className='h-2 w-12 rounded-full bg-green-700' />;
  }

  // inactive signer
  return <div className='h-2 w-12 rounded-full bg-gray-700' />;
};

const SignersIndicator = ({ threshold, signers, maxSigners }: SignersIndicatorProps) => {
  if (!isNumber(threshold) || !isNumber(signers) || !isNumber(maxSigners)) return null;
  // TODO better loading state

  return (
    <div className='flex w-fit flex-col gap-2'>
      <div className='flex w-fit items-center gap-2'>
        {map(Array.from({ length: maxSigners }), (_, index) => (
          <SignerIndicator key={index} index={index + 1} threshold={threshold} signers={signers} />
        ))}
      </div>

      {signers > threshold ? (
        <p className='text-center'>
          {threshold} confirmations required of {maxSigners} council members
        </p>
      ) : (
        <p className='text-center'>
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
