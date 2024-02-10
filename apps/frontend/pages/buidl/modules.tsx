import {
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  Tab,
  // TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { orderedChains } from '@hatsprotocol/constants';
import { chainsMap, explorerUrl, formatAddress } from 'app-utils';
import { useHatsModules } from 'hats-hooks';
import { ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';
import React from 'react';
import { ChakraNextLink, Layout } from 'ui';

const ModulesForChain = ({ chainId }: { chainId: SupportedChains }) => {
  const { modules } = useHatsModules({ chainId });

  return (
    <TabPanel minH='450px' as={Flex} direction='column' justify='space-between'>
      <Stack spacing={3}>
        {_.map(modules, (m: ModuleDetails) => (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${m.implementationAddress}`}
            isExternal
          >
            <Flex key={m.id} justify='space-between'>
              <Heading size='xs'>{m.name}</Heading>
              <Text variant='mono'>
                {formatAddress(m.implementationAddress)}
              </Text>
            </Flex>
          </ChakraNextLink>
        ))}
      </Stack>
      <Flex justify='end'>
        <Text>Total Modules: {_.size(modules)}</Text>
      </Flex>
    </TabPanel>
  );
};

const LONG_NAMES = [10, 42161];

const Modules = () => (
  <Layout>
    <Stack pt='100px' align='center' spacing={6}>
      <Heading>Modules by Chain</Heading>
      <Card maxW='600px'>
        <CardBody>
          <Tabs colorScheme='blue'>
            <TabList overflow='scroll'>
              {_.map(orderedChains, (chainId: SupportedChains) => (
                <Tab
                  key={chainId}
                  minW={_.includes(LONG_NAMES, chainId) ? '140px' : 'auto'}
                  _selected={{
                    color: 'blue.500',
                    fontWeight: 'bold',
                    bg: 'blue.50',
                  }}
                >
                  {chainsMap(chainId)?.name}
                </Tab>
              ))}
            </TabList>
            {/* indicator not working with overflow: scroll on tablist */}
            {/* <TabIndicator
                mt='-1.5px'
                height='2px'
                bg='blue.500'
                borderRadius='1px'
              /> */}

            <TabPanels>
              {_.map(orderedChains, (chainId: SupportedChains) => (
                <ModulesForChain key={chainId} chainId={chainId} />
              ))}
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Stack>
  </Layout>
);

export default Modules;
