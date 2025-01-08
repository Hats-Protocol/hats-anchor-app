'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Card,
  CardBody,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
// import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // useEffect(() => {
  //   // Optionally log the error to an error reporting service
  //   console.error(error);
  // }, [error]);

  return (
    <main className='flex h-full min-h-screen flex-col items-center justify-center'>
      <Stack spacing={10} w='60%'>
        <h2 className='text-center text-xl font-bold'>Something went wrong</h2>

        <Flex justifyContent='center'>
          <Button
            variant='primary'
            onClick={
              // Attempt to recover by trying to re-render the route
              () => reset()
            }
          >
            Refresh
          </Button>
        </Flex>

        <Card>
          <CardBody>
            <Accordion allowToggle borderTop='transparent' borderBottom='transparent'>
              <AccordionItem>
                <AccordionButton display='flex' justifyContent='space-between'>
                  <h2>View Error</h2>

                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel bg='blackAlpha.800'>
                  <Text fontFamily='mono' color='white' noOfLines={6}>
                    {error.message}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>
      </Stack>
    </main>
  );
}
