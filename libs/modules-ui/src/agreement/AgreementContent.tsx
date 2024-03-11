import { Box } from '@chakra-ui/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';

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
