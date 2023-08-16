import { Box, Heading, Stack } from '@chakra-ui/react';
import { is } from 'date-fns/locale';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import EventHistory from '@/components/EventHistory';
import WearersList from '@/components/HatDrawer/WearersList';
import { STATUS } from '@/constants';
import { checkAddressIsContract } from '@/lib/contract';
import { HatDetails, HatRole, IHat } from '@/types';

import DetailList from './DetailList';
import GuildRoles from './GuildRoles';
import Header from './Header';
import LinkRequests from './LinkRequests';
import StatusCard from './Status';

const MainContent = ({
  chainId,
  hatData,
  isEligible,
  hatRoles,
  mutableStatus,
  activeStatus,
  setModals,
  localOverlay,
  isAdminUser,
  hatDetails,
  isCurrentWearer,
  linkRequestFromTree,
}: MainContentProps) => {
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);
  const {
    name,
    description,
    responsibilities,
    authorities,
    toggle,
    eligibility,
  } = hatDetails;

  useEffect(() => {
    const check = async () => {
      const checkPromises = [
        await checkAddressIsContract(hatData?.eligibility, chainId),
        await checkAddressIsContract(hatData?.toggle, chainId),
      ];
      const data: unknown[] = await Promise.all(checkPromises);
      setIsEligibilityAContract(_.first(data) as boolean);
      setIsToggleAContract(_.nth(data, 1) as boolean);
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
        name={name || hatData?.details}
        description={description}
        mutableStatus={mutableStatus}
        activeStatus={activeStatus}
        isCurrentWearer={isCurrentWearer}
        hatId={hatData.id}
        levelAtLocalTree={hatData.levelAtLocalTree}
      />

      <WearersList
        hatName={name}
        chainId={chainId}
        setModals={setModals}
        localOverlay={localOverlay}
        hatId={hatData.id}
        wearers={hatData.extendedWearers}
        maxSupply={_.toNumber(hatData.maxSupply)}
        isAdminUser={isAdminUser}
      />

      <GuildRoles hatRoles={hatRoles} />

      <DetailList title='Responsibilities' details={responsibilities} />
      <DetailList title='Authorities' details={authorities} />

      {toggle?.criteria?.length && (
        <DetailList title='Toggle Criteria' details={toggle.criteria} />
      )}
      {eligibility?.criteria?.length && (
        <DetailList
          title='Eligibility Criteria'
          details={eligibility.criteria}
        />
      )}

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
  hatData: IHat;
  isEligible: boolean;
  hatRoles: HatRole[];
  mutableStatus: string;
  activeStatus: string;
  isCurrentWearer: boolean;
  isAdminUser: boolean;
  hatDetails: HatDetails;
  linkRequestFromTree: any[];
  setModals: any;
  localOverlay: any;
}
