import { IconButton, Flex, Icon } from '@chakra-ui/react';
import { FaPlus, FaLink } from 'react-icons/fa';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { prettyIdToId, prettyIdToIp, isAdmin } from '../../lib/hats';

function Node({
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  handleRequestLink,
  activeHatId,
  wearerHats,
  chainId,
}) {
  const [isHover, setIsHover] = useState(false);
  const userChain = useChainId();
  const { address } = useAccount();
  const { attributes, name } = rd3tProps.nodeDatum;
  const { treeId } = attributes;

  const isHatActive = BigNumber.from(activeHatId).eq(
    BigNumber.from(prettyIdToId(name)),
  );

  const isWearerOrAdminOfHat = isAdmin(name, wearerHats, true);

  useEffect(() => {
    if (isHatActive) {
      rd3tProps.onNodeClick();
    }
  }, []);

  return (
    <g>
      <defs>
        <pattern
          id={name}
          x='0%'
          y='0%'
          height='100%'
          width='100%'
          viewBox='0 0 512 512'
        >
          <image
            x='0%'
            y='0%'
            width='512'
            height='512'
            href={attributes.imageURI}
          />
        </pattern>
      </defs>
      <circle
        r={isHatActive || isHover ? 30 : 25}
        fill={attributes.imageURI !== undefined ? `url(#${name})` : 'grey'}
        fillRule='evenOdd'
        style={{
          stroke: isHatActive ? '#437bc9' : '#6d858f',
          strokeWidth: isHatActive ? '4px' : '2px',
          strokeOpacity: '50%',
        }}
        onClick={() => {
          handleNodeClick(name, treeId);
          rd3tProps.onNodeClick();
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      />
      {address && (
        <foreignObject width={125} height={200} x={35} y={-25}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h4 style={{}}>ID {prettyIdToIp(name)}</h4>
            <Flex gap={1}>
              {chainId === userChain && isWearerOrAdminOfHat && (
                <IconButton
                  colorScheme='black'
                  borderRadius={6}
                  _hover={{
                    backgroundColor: 'rgb(225, 233, 236)',
                  }}
                  w='min-content'
                  icon={<Icon as={FaPlus} />}
                  onClick={() => handleAddChildClick(name)}
                  size='xs'
                  variant='outline'
                />
              )}
              {wearerHats?.length > 0 && (
                <IconButton
                  colorScheme='black'
                  borderRadius={6}
                  _hover={{
                    backgroundColor: 'rgb(225, 233, 236)',
                  }}
                  w='min-content'
                  icon={<Icon as={FaLink} />}
                  onClick={() => handleRequestLink(name)}
                  size='xs'
                  variant='outline'
                />
              )}
            </Flex>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default function TreeNode(
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  handleRequestLink,
  activeHatId,
  wearerHats,
  chainId,
) {
  return (
    <Node
      rd3tProps={rd3tProps}
      handleNodeClick={handleNodeClick}
      handleAddChildClick={handleAddChildClick}
      handleRequestLink={handleRequestLink}
      activeHatId={activeHatId}
      wearerHats={wearerHats}
      chainId={chainId}
    />
  );
}
