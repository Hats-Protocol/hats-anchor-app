import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  Icon,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { validateURL } from '@/lib/general';
import { DetailsItem } from '@/types';

const AccordionWrap = ({ children }: { children: ReactNode }) => (
  <Accordion>
    <AccordionItem>
      <AccordionButton>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
          Qualifications
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>{children}</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const DetailList = ({
  title,
  details,
}: {
  title: string;
  details?: DetailsItem[];
}) => {
  const toggleOrEligibility =
    title === 'Eligibility Criteria' || title === 'Toggle Criteria';

  const renderDetails = () => (
    <Stack>
      {!toggleOrEligibility && (
        <Heading
          size={toggleOrEligibility ? 'xs' : 'sm'}
          fontWeight='medium'
          textTransform='uppercase'
        >
          {title}
        </Heading>
      )}
      <UnorderedList>
        {details?.length ? (
          details.map(({ label, link }: DetailsItem) => (
            <ListItem key={label}>
              <Flex justifyContent='space-between'>
                {link && validateURL(link) ? (
                  <ChakraNextLink isExternal href={link}>
                    <Text>{label}</Text>
                  </ChakraNextLink>
                ) : (
                  <Text>{label}</Text>
                )}
                {link && validateURL(link) && (
                  <ChakraNextLink isExternal href={link} display='block'>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </ChakraNextLink>
                )}
              </Flex>
            </ListItem>
          ))
        ) : (
          <ListItem>None</ListItem>
        )}
      </UnorderedList>
    </Stack>
  );

  return toggleOrEligibility ? (
    <AccordionWrap>{renderDetails()}</AccordionWrap>
  ) : (
    renderDetails()
  );
};

export default DetailList;
