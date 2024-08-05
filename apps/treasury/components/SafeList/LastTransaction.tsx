import {
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  NETWORK_CURRENCY,
  NETWORK_CURRENCY_IMAGE,
} from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import { first, get } from 'lodash';
import {
  BsFillArrowDownRightCircleFill,
  BsFillArrowUpRightCircleFill,
} from 'react-icons/bs';
import { explorerUrl, formatRoundedDecimals, shortDateFormatter } from 'utils';

const TRANSACTION_TYPE = {
  inbound: 'inbound',
  outbound: 'outbound',
};

const LastTransaction = ({
  type,
  transaction,
}: {
  type: string;
  transaction: any;
}) => {
  const { chainId } = useTreasury();
  if (!transaction) return null;

  return (
    <HStack spacing={4}>
      <Stack align='center'>
        {type === TRANSACTION_TYPE.inbound ? (
          <Icon
            as={BsFillArrowDownRightCircleFill}
            boxSize={6}
            color='green.200'
          />
        ) : (
          <Icon as={BsFillArrowUpRightCircleFill} boxSize={6} color='red.200' />
        )}

        <Heading variant='medium' size='xs'>
          {type === TRANSACTION_TYPE.inbound ? 'Last In' : 'Last Out'}
        </Heading>
      </Stack>

      <Link
        href={`${explorerUrl(chainId)}/tx/${get(
          transaction,
          'transactionHash',
        )}`}
      >
        <Stack align='center' spacing={0}>
          <Heading size='lg'>
            {formatRoundedDecimals({
              value: BigInt(
                get(first(get(transaction, 'transfers')), 'value', '0'),
              ),
              decimals: get(
                first(get(transaction, 'transfers')),
                'tokenInfo.decimals',
              ),
            })}
          </Heading>

          <HStack spacing={1}>
            <Image
              boxSize={4}
              src={get(
                first(get(transaction, 'transfers')),
                'tokenInfo.logoUri',
                NETWORK_CURRENCY_IMAGE[chainId || 1],
              )}
              alt={`${get(
                first(get(transaction, 'transfers')),
                'tokenInfo.symbol',
              )} logo`}
            />
            <Text size='sm'>
              {get(first(get(transaction, 'transfers')), 'tokenInfo.symbol') ||
                NETWORK_CURRENCY[chainId || 1]}
            </Text>
          </HStack>

          <Text size='xs'>
            {shortDateFormatter(new Date(get(transaction, 'executionDate')))}
          </Text>
        </Stack>
      </Link>
    </HStack>
  );
};

export default LastTransaction;
