import {
  Heading,
  HStack,
  ListItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useHatsModules } from 'hats-hooks';
import _ from 'lodash';
import React from 'react';
import { ModuleDetails, SupportedChains } from 'types';
import { Accordion, ChakraNextLink, StandaloneLayout } from 'ui';
import { chainsMap, explorerUrl, formatAddress } from 'utils';
import { useChainId } from 'wagmi';

const ModuleExplorer = () => {
  const chainId = useChainId();
  const { modules } = useHatsModules({ chainId: chainId as SupportedChains });

  return (
    <StandaloneLayout>
      <Stack py={120} w='80%' maxW='1200px' mx='auto' align='center'>
        <Heading>Module Explorer</Heading>
        <Tabs w='100%'>
          <TabList overflow='scroll'>
            {_.map(modules, (m: ModuleDetails) => (
              <Tab
                key={m.id}
                minW='140px'
                h='50px'
                _selected={{ bg: 'blue.100' }}
              >
                {m.name
                  .replace('Multi Claims Hatter', 'MCH')
                  .replace('Eligibility', '')
                  .replace('Module', '')}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {_.map(modules, (m: ModuleDetails) => (
              <TabPanel
                key={m.id}
                bg='whiteAlpha.600'
                borderBottomRadius='xl'
                pb={50}
              >
                <Stack spacing={4}>
                  <Accordion title='Details' open>
                    <Stack>
                      <Stack>
                        {_.map(m.details, (d) => (
                          <Text key={d}>{d}</Text>
                        ))}
                      </Stack>
                      <HStack>
                        <Text variant='medium'>Type: </Text>
                        {_.get(m, 'type.eligibility') && (
                          <Text>Eligibility</Text>
                        )}
                        {_.get(m, 'type.toggle') && <Text>Toggle</Text>}
                      </HStack>

                      <HStack>
                        <Text variant='medium'>Implementation Address:</Text>
                        <ChakraNextLink
                          href={`${explorerUrl(
                            _.get(m, 'deployments[0].chainId'),
                          )}/address/${m.implementationAddress}`}
                        >
                          <Text>{formatAddress(m.implementationAddress)}</Text>
                        </ChakraNextLink>
                      </HStack>
                      <Heading size='sm'>Links</Heading>
                      <UnorderedList spacing={1}>
                        {_.map(m.links, (l) => (
                          <ListItem key={l.link}>
                            <ChakraNextLink href={l.link}>
                              <Text>{l.label}</Text>
                            </ChakraNextLink>
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Stack>
                  </Accordion>
                  <Accordion title='Deployments'>
                    <UnorderedList spacing={1}>
                      {_.map(m.deployments, (d) => (
                        <ListItem key={d.chainId}>
                          <ChakraNextLink
                            href={`${explorerUrl(d.chainId)}/address/${
                              m.implementationAddress
                            }`}
                          >
                            <Text>
                              {chainsMap(_.toNumber(d.chainId))?.name} - (
                              {d.block})
                            </Text>
                          </ChakraNextLink>
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Accordion>
                  {!_.isEmpty(m.customRoles) && (
                    <Accordion title='Roles' open>
                      <Stack>
                        {_.map(m.customRoles, (r) => {
                          const functionsForRole = _.filter(
                            m.writeFunctions,
                            (f) => _.includes(f.roles, r.id),
                          );
                          return (
                            <Stack key={r.name}>
                              <HStack spacing={1}>
                                <Text>{r.name}</Text>
                                <Text fontFamily='monospace'>
                                  ({r.criteria})
                                </Text>
                              </HStack>
                              <Stack spacing={1} pl={2}>
                                <Heading size='sm'>Authorities</Heading>
                                {_.map(functionsForRole, (f) => (
                                  <Text size='sm'>{f.functionName}</Text>
                                ))}
                              </Stack>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Accordion>
                  )}
                  {/* <Accordion title='Args & Parameters'>
                    <Heading>Args & Parameters</Heading>
                  </Accordion>
                  <Accordion title='ABI'>
                    <Heading>ABI</Heading>
                  </Accordion> */}
                </Stack>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Stack>
    </StandaloneLayout>
  );
};

export default ModuleExplorer;
