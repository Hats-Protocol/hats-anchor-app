import { prettyIdToId, prettyIdToIp } from '../lib/hats';
import styles from './TreeNode.module.css';

export function TreeNode(rd3tProps, setCurrentHat) {
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
            xlinkHref={rd3tProps.nodeDatum.attributes.imageURI}
          ></image>
        </pattern>
      </defs>
      <circle
        r={25}
        fill={`url(#${rd3tProps.nodeDatum.name})`}
        style={{
          stroke: 'rgb(0,0,200)',
          strokeWidth: '2px',
          strokeOpacity: '50%',
        }}
        onClick={() => setCurrentHat(prettyIdToId(rd3tProps.nodeDatum.name))}
      ></circle>
      <foreignObject width={125} height={200} x={35} y={-25}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h4 style={{}}>ID {prettyIdToIp(rd3tProps.nodeDatum.name)}</h4>
          <button className={styles.button1} onClick={() => alert('add child')}>
            Add Child
          </button>
        </div>
      </foreignObject>
    </g>
  );
}
