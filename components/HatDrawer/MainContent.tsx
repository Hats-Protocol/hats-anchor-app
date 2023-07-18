import { Box, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import WearersList from '@/components/HatDrawer/WearersList';
import { STATUS } from '@/constants';
import { checkAddressIsContract } from '@/lib/contract';
import { DetailsItem } from '@/types';

import DetailList from './MainContentComponents/DetailList';
import EventHistory from './MainContentComponents/EventHistory';
import GuildRoles from './MainContentComponents/GuildRoles';
import Header from './MainContentComponents/Header';
import LinkRequests from './MainContentComponents/LinkRequests';
import StatusCard from './MainContentComponents/Status';

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
    <Box w='100%' overflow='scroll' height='100%'>
      <Stack
        position='relative'
        p={10}
        spacing={10}
        pt='110px'
        overflow='auto'
        height='100%'
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
        />

        <StatusCard
          statusName='Toggle'
          statusData={hatData.toggle}
          statusCheck={activeStatus === STATUS.ACTIVE}
          isAContract={isToggleAContract}
          chainId={chainId}
        />

        <LinkRequests
          linkRequestFromTree={linkRequestFromTree}
          hatData={hatData}
          setModals={setModals}
          localOverlay={localOverlay}
          chainId={chainId}
        />

        <EventHistory chainId={chainId} events={hatData.events} />
      </Stack>
    </Box>
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
