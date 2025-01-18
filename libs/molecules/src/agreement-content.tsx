import { Markdown } from 'ui';

// TODO can we use `Markdown` from 'ui/atoms' here?

export const AgreementContent = ({ agreement }: { agreement: string }) => {
  if (!agreement) return null;
  const formattedAgreement = agreement
    .replace(/{\.underline}/g, '') // replace weird format provided in original agreement copy
    .replace(/\[\*\[|\[\[/g, '[') // replace escaped brackets
    .replace(/\]\*\]|\]\]/g, ']'); // replace escaped brackets

  return (
    <div className='markdown-content'>
      <Markdown>{formattedAgreement}</Markdown>
    </div>
  );
};
export default AgreementContent;
