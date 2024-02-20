import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { AUTHORITY_ENFORCEMENT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import { useSafeDetails } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { authorityImageHandler, ipfsUrl } from 'utils';
import { Hex } from 'viem';

const AuthorityItemMobile = ({ authority }: AuthorityItemMobileProps) => {
  const { label, type, hsgConfig, safe } = _.pick(authority, [
    'label',
    'type',
    'hsgConfig',
    'safe',
  ]);
  const { chainId, selectedHat, editMode } = useTreeForm();

  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type]
    : AUTHORITY_ENFORCEMENT.manual;

  const { isIpfs, imageUrl } = authorityImageHandler({
    authority,
    authorityEnforcement,
  });

  const { data: safeOwners } = useSafeDetails({
    safeAddress: safe,
    chainId,
    enabled: !!safe,
    editMode,
  });
  const eligibleSigners = useMemo(() => {
    if (!safeOwners || !selectedHat?.wearers) return [];
    return _.filter(
      safeOwners,
      (owner: Hex) =>
        !_.includes(_.map(selectedHat.wearers, 'id'), _.toLower(owner)),
    );
  }, [safeOwners, selectedHat?.wearers]);
  const currentThresholdConfig = useMemo(() => {
    if (authority?.label === 'HSG Owner' || !hsgConfig) return undefined;
    const minThreshold = _.toNumber(hsgConfig?.minThreshold);
    const maxThreshold = _.toNumber(hsgConfig?.maxThreshold);
    const currentSigners = _.size(eligibleSigners);
    if (currentSigners < minThreshold) {
      return `${currentSigners}/${minThreshold}`;
    }
    if (currentSigners > maxThreshold) {
      return `${maxThreshold}/${currentSigners}`;
    }
    return `${currentSigners}/${currentSigners}`;
  }, [hsgConfig, eligibleSigners, authority?.label]);

  return (
    <HStack w='100%' align='center'>
      <Image
        src={
          isIpfs
            ? ipfsUrl(imageUrl?.slice(7)) || ''
            : imageUrl ||
              authorityEnforcement.imageUri ||
              '/icons/authority.svg'
        }
        boxSize='24px'
        border='1px solid'
        borderColor='blackAlpha.300'
        borderRadius='full'
        alt='authority image'
      />
      <Box textAlign='left'>
        <HStack>
          <Text size='md' variant='medium' noOfLines={1}>
            {label || 'New Authority'}
            {currentThresholdConfig && ` (${currentThresholdConfig} signers)`}
          </Text>
        </HStack>
      </Box>
    </HStack>
  );
};

interface AuthorityItemMobileProps {
  authority: Authority | undefined;
}

export default AuthorityItemMobile;
