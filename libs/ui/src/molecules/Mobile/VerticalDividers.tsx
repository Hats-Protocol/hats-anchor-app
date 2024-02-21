import { Box, Divider } from '@chakra-ui/react';
import _ from 'lodash';

const VerticalDividers = ({ count }: { count: number }) => {
  return (
    <Box
      position='absolute'
      style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      bg='white'
    >
      {_.map(_.range(count), (index) => (
        <Divider
          key={index}
          orientation='vertical'
          position='absolute'
          left={index * 2}
          borderColor='gray.200'
        />
      ))}
    </Box>
  );
};

export default VerticalDividers;
