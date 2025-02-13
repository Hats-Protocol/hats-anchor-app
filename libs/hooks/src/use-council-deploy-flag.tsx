import { useEffect } from 'react';

const useCouncilDeployFlag = (draftId: string, flag: boolean = false) => {
  useEffect(() => {
    try {
      const deployValue = localStorage.getItem(`deployOnly-${draftId}`);
      if (deployValue) return;
      localStorage.setItem(`deployOnly-${draftId}`, flag ? 'true' : 'false');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting deployFlag', error);
    }
  }, [draftId, flag]);
};

export { useCouncilDeployFlag };
