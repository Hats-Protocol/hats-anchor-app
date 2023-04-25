import { Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { prettyIdToId, prettyIdToIp, isAdmin } from '../../lib/hats';
import styles from './TreeNode.module.css';

function Node({
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  activeHatId,
  wearerHats,
  chainId,
}) {
  const [isHover, setIsHover] = useState(false);
  const userChain = useChainId();
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
      <foreignObject width={125} height={200} x={35} y={-25}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h4 style={{}}>ID {prettyIdToIp(name)}</h4>
          {chainId === userChain && isWearerOrAdminOfHat && (
            <Button
              className={styles.button1}
              type='button'
              onClick={() => handleAddChildClick(name)}
              fontSize='sm'
              fontWeight='normal'
            >
              Add Child Hat
            </Button>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

export default function TreeNode(
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  activeHatId,
  wearerHats,
  chainId,
) {
  return (
    <Node
      rd3tProps={rd3tProps}
      handleNodeClick={handleNodeClick}
      handleAddChildClick={handleAddChildClick}
      activeHatId={activeHatId}
      wearerHats={wearerHats}
      chainId={chainId}
    />
  );
}
