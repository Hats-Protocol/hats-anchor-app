import React, { useLayoutEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import { Spinner } from '@chakra-ui/react';
import router from 'next/router';

export interface Data {
  id: string;
  name: string;
  parentId: string | null;
  imageURI: string;
  treeId: string;
  dottedLine?: boolean;
  url: string;
  details?: any;
}

interface OrgChartComponentProps {
  tree: Data[] | null;
  isLoading: boolean;
  chainId: number;
  handleAddChildClick: (nodePrettyId: string) => void;
  wearerHats: string[];
  activeHatId: string;
}

const OrgChartComponent: React.FC<OrgChartComponentProps> = ({
  tree,
  isLoading,
  chainId,
  handleAddChildClick,
  wearerHats,
  activeHatId,
}) => {
  console.log(handleAddChildClick, chainId, wearerHats, activeHatId);
  const d3Container = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<OrgChart<unknown> | null>(null);

  useLayoutEffect(() => {
    if (tree && d3Container.current) {
      if (!chart) {
        setChart(new OrgChart());
      } else {
        chart
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .container(d3Container.current)
          .data(tree)
          .svgHeight(480)
          .nodeHeight(() => 106)
          .nodeWidth(() => 220)
          .onNodeClick((node: any) => {
            const hat = tree.find((h) => h.id === node);
            if (hat) {
              router.push(hat.url, undefined, { scroll: false });
            }
          })
          .nodeContent((d: any) => {
            const { imageURI, name, details } = d.data;

            return `
              <div style='width:${d.width}px; height:${
              d.height
            }px; padding-top: 27px; padding-left:1px; padding-right:1px'>
                <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.92); border: 1px solid #4A5568; border-radius: 4px; width: ${
                  d.width - 2
                }px; height: 70px;">
                  <img src="${
                    imageURI ?? '/icon.jpeg'
                  }" style="width: 70px; height: 70px;" />
                  <div style="display: flex; flex-direction: column; padding: 10px; height: 100%">
                    <div style="font-size: 15px; color: #08011E;">${name}</div>
                    <div style="font-size: 12px; color: #08011E;">${details}</div>
                  </div>
                </div>
              </div>`;
          })

          .render();
      }
    }
  }, [chart, tree, isLoading, chainId]);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          style={{
            height: 400,
          }}
          ref={d3Container}
          id='d3Container'
        />
      )}
    </div>
  );
};

export default OrgChartComponent;
