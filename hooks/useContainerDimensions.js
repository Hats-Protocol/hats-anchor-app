import { useCallback, useState } from 'react';

const useContainerDimensions = () => {
  const [dimensions, setDimensions] = useState(undefined);
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);
  return [dimensions, containerRef];
};

export default useContainerDimensions;
