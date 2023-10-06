import {
  Box,
  Button,
  Code,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { ReactNode, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsFileCode, BsPersonAdd } from 'react-icons/bs';

import Select from '@/components/atoms/Select';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import usePendHatterMint from '@/hooks/usePendHatterMint';
import { formatAddress } from '@/lib/general';

const ClaimsHandlerWrapper = ({ children }: { children: ReactNode }) => (
  <FormRowWrapper>
    <Icon as={BsPersonAdd} boxSize={4} mt='2px' />
    <Stack>
      <HStack fontSize='sm'>
        <Text color='blackAlpha.800' fontWeight='medium'>
          HAT CLAIMING
        </Text>
      </HStack>

      {children}
    </Stack>
  </FormRowWrapper>
);

const ClaimsHandler = ({
  localForm,
  onOpenModuleDrawer,
  setIsStandAloneHatterDeploy,
}: {
  localForm: UseFormReturn;
  onOpenModuleDrawer: () => void;
  setIsStandAloneHatterDeploy: (value: boolean) => void;
}) => {
  const { selectedHat, treeToDisplay, selectedHatDetails } = useTreeForm();
  const { claimableHats, instanceAddress, hatterIsAdmin } =
    useMultiClaimsHatterCheck();
  const isClaimable = useMemo(
    () => _.includes(claimableHats, selectedHat?.id),
    [claimableHats, selectedHat?.id],
  );
  const { watch, setValue } = _.pick(localForm, ['watch', 'setValue']);

  const { availableAdmins, hatToMintPended, pendMintHatForHatter } =
    usePendHatterMint({
      address: instanceAddress,
    });

  const hatToMintTo = watch('hatToMintTo');

  useEffect(() => {
    if (treeToDisplay) {
      const localHatToMintTo = _.get(_.first(availableAdmins), 'id');
      setValue('hatToMintTo', localHatToMintTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isClaimable) {
    return (
      <ClaimsHandlerWrapper>
        <Text fontSize='sm' color='gray.500' mt={1}>
          To enable permissionless claiming of this hat, deploy a claims hatter
          contract and give that contract an admin hat in this tree.
        </Text>
        <Box>
          <Button
            leftIcon={<BsFileCode />}
            variant='outline'
            fontWeight='normal'
            borderColor='blackAlpha.300'
            onClick={() => {
              onOpenModuleDrawer();
              setIsStandAloneHatterDeploy(true);
            }}
          >
            Deploy Claims Hatter
          </Button>
        </Box>
      </ClaimsHandlerWrapper>
    );
  }

  return (
    <ClaimsHandlerWrapper>
      {hatterIsAdmin ? (
        <Stack>
          <Text fontSize='sm' color='gray.500' mt={1}>
            This hat has a claims hatter contract deployed, and permissionless
            claiming is enabled. Potential wearers will be able to claim this
            hat if they meet the requirements in this hat&quot;s accountability
            module.
          </Text>
          <Text>
            Claims hatter contract <Code>{formatAddress(instanceAddress)}</Code>
            is wearing hat {hatIdDecimalToIp(BigInt(hatToMintTo))}{' '}
            {selectedHatDetails?.name}
          </Text>
        </Stack>
      ) : (
        <Stack>
          <Text>
            A claims hatter exists at{' '}
            <Code>{formatAddress(instanceAddress)}</Code>, but it is not an
            admin of this hat.
          </Text>
          <Select localForm={localForm} name='hatToMintTo'>
            {_.map(availableAdmins, (a) => (
              <option value={a.id}>
                {hatIdDecimalToIp(BigInt(a.id))} {a.detailsObject?.data.name}
              </option>
            ))}
          </Select>
          {hatToMintTo && (
            <Flex justify='end'>
              <Tooltip
                label={
                  hatToMintPended &&
                  `Mint pended for hatter on hat #${hatIdDecimalToIp(
                    BigInt(hatToMintTo),
                  )}`
                }
                placement='left'
              >
                <Button
                  size='xs'
                  color='blue.500'
                  borderColor='blue.500'
                  variant='outline'
                  isDisabled={!hatToMintTo || hatToMintPended}
                  onClick={pendMintHatForHatter}
                >
                  Mint {hatIdDecimalToIp(BigInt(hatToMintTo))} to{' '}
                  {formatAddress(instanceAddress)}
                </Button>
              </Tooltip>
            </Flex>
          )}
        </Stack>
      )}
    </ClaimsHandlerWrapper>
  );
};

export default ClaimsHandler;
