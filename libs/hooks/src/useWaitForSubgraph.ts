import useToast from './useToast';

const useWaitForSubgraph = ({
  fetchHelper,
  checkResult,
  interval = 1000,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchHelper: () => Promise<any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkResult: (value: any) => boolean;
  interval?: number;
}) => {
  const toast = useToast();
  const waitForResult = async () =>
    new Promise((resolve) => {
      const checkResultHandler = async () => {
        try {
          const result = await fetchHelper();

          if (result && checkResult(result)) {
            clearInterval(intervalId);

            toast.success({
              title: 'Subgraph updated!',
            });
            return Promise.resolve(result);
          }
          return undefined;
        } catch (e) {
          toast.error({
            title: 'Error',
            description: 'An error occurred while waiting for subgraph',
          });

          return Promise.reject(e);
        }
      };

      toast.info({
        title: 'Waiting for subgraph...',
      });

      const intervalId = setInterval(checkResultHandler, interval);
      checkResultHandler();

      setTimeout(() => {
        clearInterval(intervalId);
        resolve(null);
      }, 20000);
    });

  return waitForResult;
};

export default useWaitForSubgraph;
