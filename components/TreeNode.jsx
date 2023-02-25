import { prettyIdToId, prettyIdToIp, isAdmin } from '../lib/hats';
import styles from './TreeNode.module.css';
import { Button, Modal } from '@chakra-ui/react';
import { useOverlay } from '../contexts/OverlayContext';
import { BigNumber } from 'ethers';
import { useState } from 'react';

export default function TreeNode(
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  activeHatId,
  wearerHats,
) {
  return (
    <Node
      rd3tProps={rd3tProps}
      handleNodeClick={handleNodeClick}
      handleAddChildClick={handleAddChildClick}
      activeHatId={activeHatId}
      wearerHats={wearerHats}
    ></Node>
  );
}

function Node({
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  activeHatId,
  wearerHats,
}) {
  const [isHover, setIsHover] = useState(false);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  let isHatActive = BigNumber.from(activeHatId).eq(
    BigNumber.from(prettyIdToId(rd3tProps.nodeDatum.name)),
  );

  let isUserAdminOfHat = isAdmin(
    prettyIdToId(rd3tProps.nodeDatum.name),
    wearerHats,
  );

  return (
    <g>
      <defs>
        <pattern
          id={rd3tProps.nodeDatum.name}
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
            href={rd3tProps.nodeDatum.attributes.imageURI}
          />
        </pattern>
      </defs>
      <circle
        r={isHatActive || isHover ? 30 : 25}
        fill={
          rd3tProps.nodeDatum.attributes.imageURI !== undefined
            ? `url(#${rd3tProps.nodeDatum.name})`
            : 'grey'
        }
        style={{
          stroke: isHatActive ? '#437bc9' : '#6d858f',
          strokeWidth: isHatActive ? '4px' : '2px',
          strokeOpacity: '50%',
        }}
        onClick={() => handleNodeClick(rd3tProps.nodeDatum.name)}
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
          <h4 style={{}}>ID {prettyIdToIp(rd3tProps.nodeDatum.name)}</h4>
          {isUserAdminOfHat && (
            <Button
              className={styles.button1}
              type='button'
              onClick={() => handleAddChildClick(rd3tProps.nodeDatum.name)}
            >
              Add Child
            </Button>
          )}
        </div>
      </foreignObject>
    </g>
  );
}
