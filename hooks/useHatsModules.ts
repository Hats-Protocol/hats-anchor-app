import { useEffect, useState } from 'react';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

const useHatsModules = () => {
  const { chainId } = useTreeForm();
  const [modules, setModules] = useState<any>([]);

  useEffect(() => {
    const fetchModules = async () => {
      const hatsClient = await createHatsModulesClient(chainId);
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
