'use client';

import {
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  useControllerList,
  useHatsAdminOf,
  useWearerDetails,
} from 'hats-hooks';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { Hex } from 'viem';
type HeadlineStat = {
  label: string;
  value: number;
  loading: boolean;
};

const WearerStats = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = _.get(
    parsedPathname,
    _.subtract(_.size(parsedPathname), 1),
  ) as Hex;
  console.log(pathname, wearerAddress);

  const { data: currentHats } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const { data: controllerHats } = useControllerList({
    address: wearerAddress,
  });
  const { data: adminOfHats } = useHatsAdminOf({
    hats: currentHats,
  });

  const headlineStats = [
    {
      label: 'Wearer of',
      value: _.size(currentHats),
      loading: !!currentHats,
    },
    {
      label: 'Admin of',
      value: _.size(adminOfHats),
      loading: !!adminOfHats,
    },
    {
      label: 'Eligibility for',
      value: _.size(
        _.filter(controllerHats, ['eligibility', _.toLower(wearerAddress)]),
      ),
      loading: !!controllerHats,
    },
    {
      label: 'Toggle for',
      value: _.size(
        _.filter(controllerHats, ['toggle', _.toLower(wearerAddress)]),
      ),
      loading: !!controllerHats,
    },
  ];

  return (
    <HStack wrap='wrap' justify='center'>
      {_.map(headlineStats, (stat: HeadlineStat) => (
        <Card w={{ base: '22%', md: '135px' }} key={stat.label}>
          <CardBody px={{ base: 0, md: 6 }} py={{ base: 2, md: 4 }}>
            <Stack align='center'>
              <Text size={{ base: 'xs', md: 'sm' }}>{stat.label}</Text>
              <Skeleton isLoaded={stat.loading}>
                <Heading size={{ base: 'md', md: '2xl' }}>{stat.value}</Heading>
              </Skeleton>
            </Stack>
          </CardBody>
        </Card>
      ))}
    </HStack>
  );
};

export default WearerStats;
