import React, { useLayoutEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import { Spinner } from '@chakra-ui/react';

export interface Data {
  id: string;
  name: string;
  parentId: string | null;
  imageURI: string;
  treeId: string;
  dottedLine?: boolean;
}

interface OrgChartComponentProps {
  tree: Data[] | null;
  onNodeClick: (nodePrettyId: string, nodeTreeId: string) => void;
  setClick: (addNode: (node: Data) => void) => void;
  isLoading: boolean;
}

const OrgChartComponent: React.FC<OrgChartComponentProps> = ({
  tree,
  onNodeClick,
  setClick,
  isLoading,
}) => {
  const d3Container = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<OrgChart<unknown> | null>(null);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  function addNode(node: Data) {
    if (chart) {
      chart.addNode(node);
    }
  }

  setClick(addNode);

  useLayoutEffect(() => {
    if (tree && d3Container.current) {
      const containerId = 'd3Container';
      d3Container.current.id = containerId;

      if (!chart) {
        setChart(new OrgChart());
      } else {
        chart
          .container(`#${containerId}`)
          .data(tree)
          .svgHeight(480)
          .nodeHeight(() => 85)
          .nodeWidth(() => 220)
          .onNodeClick((node) => {
            const hat = tree.find((h) => h.id === node);
            if (hat) onNodeClick(hat.id, hat.treeId);
          })
          .nodeContent((d: any) => {
            const color = '#FFFFFF';
            const imageDiffVert = 25 + 2;
            const { name } = d.data;

            return `
            <div style='width:${d.width}px;height:${d.height}px;padding-top:${
              imageDiffVert - 2
            }px;padding-left:1px;padding-right:1px'>
                    <div style="font-family: 'Inter', sans-serif;background-color:${color};  margin-left:-1px;width:${
              d.width - 2
            }px;height:${
              d.height - imageDiffVert
            }px;border-radius:10px;border: 1px solid #E4E2E9">
                        <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${name}</div>
                        <div style="background-color:${color};margin-top:${
              -imageDiffVert - 20
            }px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
                        <div style="margin-top:${
                          -imageDiffVert - 20
                        }px;">   <img src=" ${
              d.data.imageURI ?? '/icon.jpeg'
            }" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div>
                        <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${
                          d.data.name
                        } </div>
                        <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${
                          d.data.position
                        } </div>

                    </div>
                </div>
                        `;
          })
          .render();
      }
    }
  }, [chart, onNodeClick, tree, isLoading]);

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
