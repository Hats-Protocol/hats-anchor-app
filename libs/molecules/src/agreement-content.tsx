import { Markdown, Skeleton } from 'ui';

interface AgreementContentProps {
  agreement: string | undefined;
  isLoading?: boolean;
}

const AgreementContent = ({ agreement, isLoading = false }: AgreementContentProps) => {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Title */}
        <Skeleton className='h-8 w-3/4' />

        {/* Paragraphs */}
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-16 w-full' />
        <Skeleton className='h-20 w-full' />

        {/* List items */}
        <div className='space-y-2'>
          <Skeleton className='h-6 w-5/6' />
          <Skeleton className='h-6 w-4/6' />
          <Skeleton className='h-6 w-5/6' />
        </div>

        {/* Final paragraph */}
        <Skeleton className='h-16 w-full' />
      </div>
    );
  }

  if (!agreement) return null;

  const formattedAgreement = agreement
    .replace(/{\.underline}/g, '') // replace weird format provided in original Hats Community agreement copy
    .replace(/\[\*\[|\[\[/g, '[') // replace escaped brackets
    .replace(/\]\*\]|\]\]/g, ']'); // replace escaped brackets

  return (
    <div className='markdown-content'>
      <Markdown>{formattedAgreement}</Markdown>
    </div>
  );
};

export { AgreementContent };
