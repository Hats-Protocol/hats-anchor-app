'use client';

import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

// TODO can we use `Markdown` from 'ui/atoms' here?

const AgreementContent = ({ agreement }: { agreement: string }) => {
  if (!agreement) return null;
  const formattedAgreement = agreement
    .replace(/{\.underline}/g, '') // replace weird format provided in original agreement copy
    .replace(/\[\*\[|\[\[/g, '[') // replace escaped brackets
    .replace(/\]\*\]|\]\]/g, ']'); // replace escaped brackets

  return (
    <Box className='markdown-content'>
      <ReactMarkdown>{formattedAgreement}</ReactMarkdown>
    </Box>
  );
};
export default AgreementContent;
