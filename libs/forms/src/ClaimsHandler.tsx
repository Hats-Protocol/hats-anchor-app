'use client';

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
import { MULTI_CLAIMS_HATTER_ABI } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { usePendHatterMint, useWaitForSubgraph } from 'hooks';
import _, { get } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import { ReactNode, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsFileCode, BsPersonAdd } from 'react-icons/bs';
import { AppHat } from 'types';
import { formatAddress } from 'utils';
import { useWriteContract } from 'wagmi';

import { FormRowWrapper, Select } from './components';

const ClaimsHandlerWrapper = ({ children }: { children: ReactNode }) => (
  <FormRowWrapper>
    <Icon as={BsPersonAdd} boxSize={4} mt='2px' />
    <Stack>
      <HStack>
        <Text variant='lightMedium' fontSize='sm'>
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
  const {
    treeToDisplay,
    chainId,
    storedData,
    onchainHats,
    editMode,
    setStoredData,
  } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { writeContractAsync } = useWriteContract();
  const {
    instanceAddress,
    hatterIsAdmin,
    wearingHat: wearingHatId,
    claimableHats,
  } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    storedData,
    onchainHats,
    editMode,
  });
  const { watch, setValue } = _.pick(localForm, ['watch', 'setValue']);
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const hatToMintTo = watch('hatToMintTo');
  const { availableAdmins, hatToMintPended, pendMintHatForHatter } =
    usePendHatterMint({
      address: instanceAddress,
      hatToMintTo,
      treeToDisplay,
      selectedHat,
      storedData,
      setStoredData,
    });
  const wearingHat = useMemo(() => {
    if (!wearingHatId) return undefined;
    return _.find(treeToDisplay, { id: wearingHatId });
  }, [treeToDisplay, wearingHatId]);

  const onSuccess = () => {
    console.log('success');
  };

  const registerHat = () => {
    if (!instanceAddress || !selectedHat?.id) {
      console.log('no instance address or selected hat id', {
        instanceAddress,
        selectedHat,
      });
      return;
    }

    return writeContractAsync({
      functionName: 'setHatClaimability',
      address: instanceAddress,
      abi: MULTI_CLAIMS_HATTER_ABI,
      args: [selectedHat?.id, 1],
      chainId,
    })
      .then((hash) => {
        console.log({ hash });
        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: 'Register Hat',
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  useEffect(() => {
    if (treeToDisplay && hatToMintPended) {
      const localHatToMintTo = _.get(_.first(availableAdmins), 'id');
      setValue('hatToMintTo', hatToMintPended || localHatToMintTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!_.includes(claimableHats, selectedHat?.id) && hatterIsAdmin) {
    return (
      <ClaimsHandlerWrapper>
        <Stack mt={1}>
          <Text variant='lightMedium'>
            There is a claims hatter in the tree, but this hat is not set
            claimable.
          </Text>
          <Flex>
            <Button variant='outlineMatch' onClick={registerHat}>
              Make Claimable
            </Button>
          </Flex>
        </Stack>
      </ClaimsHandlerWrapper>
    );
  }

  if (hatterIsAdmin) {
    return (
      <ClaimsHandlerWrapper>
        <Stack mt={1}>
          <Text size='sm' color='blackAlpha.600'>
            This hat has a claims hatter contract deployed, and permissionless
            claiming is enabled. Potential wearers will be able to claim this
            hat if they meet the requirements in this hat&quot;s accountability
            module.
          </Text>
          {wearingHat && instanceAddress && (
            <Text>
              Claims hatter contract (
              <Box as='span' fontFamily='mono'>
                {formatAddress(instanceAddress)}
              </Box>
              ) is wearing Hat {hatIdDecimalToIp(BigInt(wearingHat?.id))} (
              {get(wearingHat, 'detailsObject.data.name')})
            </Text>
          )}
        </Stack>
      </ClaimsHandlerWrapper>
    );
  }

  if (!hatterIsAdmin && instanceAddress) {
    return (
      <ClaimsHandlerWrapper>
        <Stack>
          <Text>
            A claims hatter exists at{' '}
            <Code>{formatAddress(instanceAddress)}</Code>, but it is not an
            admin of this hat.
          </Text>
          <Select localForm={localForm} name='hatToMintTo'>
            {_.map(availableAdmins, (a: AppHat) => (
              <option value={a.id} key={a.id}>
                {hatIdDecimalToIp(BigInt(a.id))}{' '}
                {get(a, 'detailsObject.data.name', get(a, 'details'))}
              </option>
            ))}
          </Select>
          {(hatToMintTo || hatToMintPended) && (
            <Flex justify='end'>
              <Tooltip
                label={
                  hatToMintPended &&
                  `Mint pended for hatter on hat #${hatIdDecimalToIp(
                    BigInt(hatToMintPended || hatToMintTo),
                  )}`
                }
                placement='left'
              >
                <Button
                  size='xs'
                  colorScheme='blue.500'
                  variant='outline'
                  isDisabled={!hatToMintTo || !!hatToMintPended}
                  onClick={pendMintHatForHatter}
                >
                  Mint{' '}
                  {hatIdDecimalToIp(BigInt(hatToMintPended || hatToMintTo))} to{' '}
                  {formatAddress(instanceAddress)}
                </Button>
              </Tooltip>
            </Flex>
          )}
        </Stack>
      </ClaimsHandlerWrapper>
    );
  }

  return (
    <ClaimsHandlerWrapper>
      <Text size='sm' variant='gray' mt={1}>
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
};

export default ClaimsHandler;
