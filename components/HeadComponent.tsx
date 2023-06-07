import { NextSeo } from 'next-seo';

import CONFIG from '@/constants';
import SEO from '@/constants/next-seo.config';

const HeadComponent = ({
  title = SEO.defaultTitle,
  description = SEO.description,
  url = CONFIG.url,
  img = SEO.openGraph.images[0].url,
}) => {
  const images = [{ ...SEO.openGraph.images[0], url: img }];

  return (
    <NextSeo
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...SEO}
      title={title}
      description={description}
      canonical={url}
      openGraph={{
        ...SEO.openGraph,
        url,
        title,
        description,
        images,
      }}
    />
  );
};

export default HeadComponent;
