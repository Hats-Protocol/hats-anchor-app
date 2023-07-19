import { Box, Heading, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import EventHistory from '@/components/EventHistory';
import WearersList from '@/components/HatDrawer/WearersList';
import { STATUS } from '@/constants';
import { checkAddressIsContract } from '@/lib/contract';
import { DetailsItem } from '@/types';

import DetailList from './DetailList';
import GuildRoles from './GuildRoles';
import Header from './Header';
import LinkRequests from './LinkRequests';
import StatusCard from './Status';

const MainContent = ({
  chainId,
  hatData,
  isEligible,
  name,
  description,
  hatRoles,
  mutableStatus,
  activeStatus,
  setModals,
  localOverlay,
  isAdminUser,
  responsibilities,
  authorities,
  isCurrentWearer,
  linkRequestFromTree,
}: MainContentProps) => {
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isEligibility = await checkAddressIsContract(
        hatData?.eligibility,
        chainId,
      );
      const isToggle = await checkAddressIsContract(hatData?.toggle, chainId);
      setIsEligibilityAContract(isEligibility);
      setIsToggleAContract(isToggle);
    };
    check();
  }, [chainId, hatData]);

  if (!hatData) return null;

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      top={75}
      pos='relative'
    >
      <Header
        name={name}
        description={description}
        mutableStatus={mutableStatus}
        activeStatus={activeStatus}
        isCurrentWearer={isCurrentWearer}
        hatId={hatData.id}
        prettyId={hatData.prettyId}
        levelAtLocalTree={hatData.levelAtLocalTree}
      />

      <WearersList
        hatName={name}
        chainId={chainId}
        setModals={setModals}
        localOverlay={localOverlay}
        hatId={hatData.id}
        wearers={hatData.wearers}
        maxSupply={hatData.maxSupply}
        prettyId={hatData.prettyId}
        isAdminUser={isAdminUser}
      />

      <GuildRoles hatRoles={hatRoles} />

      <DetailList title='Responsibilities' details={responsibilities} />
      <DetailList title='Authorities' details={authorities} />

      <StatusCard
        statusName='Eligibility'
        statusData={hatData.eligibility}
        statusCheck={isEligible}
        isAContract={isEligibilityAContract}
        chainId={chainId}
        label='Can I wear this hat?'
      />

      <StatusCard
        statusName='Toggle'
        statusData={hatData.toggle}
        statusCheck={activeStatus === STATUS.ACTIVE}
        isAContract={isToggleAContract}
        chainId={chainId}
        label='Is this hat active?'
      />

      <LinkRequests
        linkRequestFromTree={linkRequestFromTree}
        hatData={hatData}
        setModals={setModals}
        localOverlay={localOverlay}
        chainId={chainId}
      />

      <Box>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={1}>
          Event history
        </Heading>
        <EventHistory chainId={chainId} events={hatData.events} />
      </Box>
    </Stack>
  );
};

export default MainContent;

interface MainContentProps {
  chainId: number;
  hatData: any;
  isEligible: boolean;
  name: string;
  description: string;
  hatRoles: any[];
  mutableStatus: string;
  activeStatus: string;
  isCurrentWearer: boolean;
  isAdminUser: boolean;
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
  linkRequestFromTree: any[];
  setModals: any;
  localOverlay: any;
}
