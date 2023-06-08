import React, { useLayoutEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';

export interface Data {
  id: string;
  parentId: string | null;
  imageURI: string;
  treeId: string;
  dottedLine?: boolean;
}

interface OrgChartComponentProps {
  tree: Data[] | null;
  onNodeClick: (nodePrettyId: string, nodeTreeId: string) => void;
  setClick: (addNode: (node: Data) => void) => void;
}

const OrgChartComponent: React.FC<OrgChartComponentProps> = ({
  tree,
  onNodeClick,
  setClick,
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
    console.log('tree', tree);
    if (tree && d3Container.current) {
      console.log('chart', chart);
      if (!chart) {
        setChart(new OrgChart());
      } else {
        chart
          .container(d3Container.current)
          .data(tree)
          .svgHeight(480)
          .nodeHeight(() => 85)
          .nodeWidth(() => 220)
          .onNodeClick((node) => {
            console.log('node', node);
            const hat = tree.find((h) => h.id === node);
            if (hat) onNodeClick(hat.id, hat.treeId);
          })
          .nodeContent((d: any) => {
            const color = '#FFFFFF';
            return `
          <div style="font-family: 'Inter', sans-serif;background-color:${color}; position:absolute;margin-top:-1px; margin-left:-1px;width:${
              d.width
            }px;height:${
              d.height
            }px;border-radius:10px;border: 1px solid #E4E2E9">
             <div style="background-color:${color};position:absolute;margin-top:-25px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
             <img src=" ${
               d.data.imageURI
             }" style="position:absolute;margin-top:-20px;margin-left:${20}px;border-radius:100px;width:40px;height:40px;" />
             
            <div style="color:#08011E;position:absolute;right:20px;top:17px;font-size:10px;"><i class="fas fa-ellipsis-h"></i></div>
  
            <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:32px"> ${
              d.data.id
            } </div>
            <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${
              d.data.positionName
            } </div>
  
  
         </div>
  `;
          })
          .render();
      }
    }
  }, [chart, tree]);

  return (
    <div>
      <div
        style={{
          height: 400,
        }}
        ref={d3Container}
      />
    </div>
  );
};

export default OrgChartComponent;
