import { useEffect, useState } from 'react';

function useMediaStyles() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [isClient, setIsClient] = useState<boolean | undefined>(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isClient };
}

export default useMediaStyles;
