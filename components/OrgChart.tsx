import React, { useLayoutEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import { Flex, Spinner } from '@chakra-ui/react';

export interface HatData {
  id: string;
  name: string;
  parentId: string | null;
  imageURI: string;
  treeId: string;
  isLinked: boolean;
  url: string;
  details?: string;
  active: boolean;
}

interface OrgChartComponentProps {
  tree: HatData[] | null;
  isLoading: boolean;
  chainId: number;
  // handleAddChildClick: (nodePrettyId: string) => void;
  wearerHats: string[];
  setSelectedNode: (node: string | null) => void;
  selectedNode: string | null;
  selectedOption?: string;
  showInactiveHats: boolean;
}

const OrgChartComponent: React.FC<OrgChartComponentProps> = ({
  tree,
  isLoading,
  chainId,
  // handleAddChildClick,
  wearerHats,
  setSelectedNode,
  selectedNode,
  selectedOption,
  showInactiveHats,
}) => {
  console.log('selectedOption', selectedOption);
  const d3Container = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<OrgChart<unknown> | null>(null);

  useLayoutEffect(() => {
    const filteredTree = tree?.filter((t) => {
      if (showInactiveHats) {
        return t;
      }
      return t.active;
    });

    if (tree && d3Container.current) {
      if (!chart) {
        setChart(new OrgChart());
      } else {
        chart
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .container(d3Container.current)
          .data(filteredTree ?? [])
          .nodeHeight(() => 70)
          .nodeWidth(() => 220)
          .onNodeClick((node: any) => setSelectedNode(node))
          .nodeContent((d: any) => {
            // State to keep track of selected node

            const isInWearerHats = wearerHats.includes(d.data.id);
            // Placeholder for your icon. Replace it with actual URL.
            const { imageURI, name, details, isLinked } = d.data;
            const hasChildren = tree.filter((t) => t.parentId === d.id).length;
            console.log('hasChildren', hasChildren);

            const detailsName =
              // eslint-disable-next-line no-nested-ternary
              details?.type === '1.0'
                ? details?.data?.name
                : typeof details === 'string'
                ? details
                : '';

            const isSelected = selectedNode === d.id;

            return `
            <div style='
              width: ${d.width}px;
              height: ${d.height}px;
              padding-left: 1px;
              padding-right: 1px;'
            >
              <div style="
                display: flex;
                align-items: center;
                background-color: white;
                border: 
                  ${isSelected ? '2px' : '1px'} 
                  ${isLinked ? 'dotted' : 'solid'} #4A5568;
                border-radius: 4px;
                width: ${d.width}px;
                height: 70px;"
              >
                  <img
                    src="${imageURI ?? '/icon.jpeg'}"
                    style="
                      background: white;
                      width: ${isSelected ? '78.5px' : '70px'};
                      height: ${isSelected ? '78.5px' : '70px'};
                      border: 
                        ${isSelected ? '2px' : '1px'} 
                        ${isLinked ? 'dotted' : 'solid'} #4A5568;
                      border-radius: 4px;
                      margin-left: ${isSelected ? -2 : -1}px;"
                  />
                  <div style="
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    position: relative;"
                  >
                      <div style="
                        display: flex;
                        flex-direction: column;
                        position: absolute;
                        left: ${isSelected ? 8 : 10}px;
                        top: ${isSelected ? 9 : 10}px;"
                      >
                          ${
                            selectedOption === 'titleOnly' && detailsName !== ''
                              ? ''
                              : `<div style="
                                  font-size: 12px;
                                  color: ${isSelected ? '#248559' : '#08011E'};"
                                >
                                  ${name}
                                </div>`
                          }
                          <div style="
                            font-size: 16px;
                            color: #08011E;
                            font-weight: 500;"
                          >
                            ${detailsName}
                          </div>
                      </div>
                  </div>
                  ${
                    isInWearerHats
                      ? `<img src='/wearer.svg'
                          style="
                            width: 16px;
                            height: 12px;
                            position: absolute;
                            right: 10px;
                            top: 10px;"
                      />`
                      : ''
                  }
              </div>
            </div>`;
          })
          .render();
      }
    }
  }, [
    chart,
    tree,
    isLoading,
    chainId,
    setSelectedNode,
    selectedNode,
    wearerHats,
    showInactiveHats,
  ]);

  // Use selectedNode anywhere you like. It will contain the id of the selected node or null if no node is selected.

  return isLoading ? (
    <Flex
      h='calc(100% - 200px)'
      w='100%'
      alignItems='center'
      justifyContent='center'
    >
      <Spinner />
    </Flex>
  ) : (
    <div
      style={{
        overflow: 'hidden',
      }}
      ref={d3Container}
      id='d3Container'
    />
  );
};

export default OrgChartComponent;
