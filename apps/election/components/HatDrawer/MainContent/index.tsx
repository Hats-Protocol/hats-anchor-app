import { Stack } from '@chakra-ui/react';
import { MODULE_TYPES } from 'app-constants';
import { checkAddressIsContract } from 'app-utils';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '../../../contexts/EligibilityContext';
import ModuleDetails from '../../ModuleDetails';
import WearersList from '../WearersList';
import DetailList from './DetailList';
import Header from './Header';
import StatusCard from './Status';

const MainContent = () => {
  const { chainId, selectedHat, selectedHatDetails } = useTreeForm();
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);

  const { toggle, eligibility } = _.pick(selectedHatDetails, [
    'toggle',
    'eligibility',
  ]);

  useEffect(() => {
    const checkEligibilityContract = async () => {
      const isContract = await checkAddressIsContract(
        selectedHat?.eligibility as Hex,
        chainId,
      );
      setIsEligibilityAContract(isContract || false);
    };
    checkEligibilityContract();
  }, [chainId, selectedHat]);

  if (!selectedHat) return null;

  return (
    <Stack
      p={10}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      pb={400}
      pos='relative'
      color='blackAlpha.800'
    >
      <Header />
      <WearersList />

      <Stack spacing={4}>
        {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
          <StatusCard
            status={MODULE_TYPES.eligibility}
            isAContract={isEligibilityAContract}
            label='Do I meet the requirements to wear this Hat?'
          />
        )}
        <ModuleDetails type={MODULE_TYPES.eligibility} />
        {!_.isEmpty(eligibility?.criteria) && (
          <DetailList
            title='Eligibility Criteria'
            details={eligibility?.criteria}
            inline
          />
        )}
      </Stack>

      {/* MODULE DETAILS */}
      {!_.isEmpty(toggle?.criteria) && (
        <DetailList title='Toggle Criteria' details={toggle?.criteria} inline />
      )}
    </Stack>
  );
};

export default MainContent;

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
