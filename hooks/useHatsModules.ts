import { useEffect, useState } from 'react';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

const useHatsModules = () => {
  const { chainId } = useTreeForm();
  const [modules, setModules] = useState<any>([]);
  const hatsClient = createHatsModulesClient(chainId);

  useEffect(() => {
    const fetchModules = async () => {
      if (hatsClient) {
        await hatsClient.prepare();
        const allModules = hatsClient.getAllModules();
        setModules(allModules);
      }
    };

    fetchModules();
  }, []);

  return { modules };
};

export default useHatsModules;
